/**
 * Swarm Command
 * Orchestrates generation and coordination of multiple API clients
 */

import { OptionValues } from 'commander';
import fs from 'fs';
import path from 'path';

import { APP_LOGGER } from '../../common/Consts';
import { Logger } from '../../common/Logger';
import { TRawOptions } from '../../common/TRawOptions';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import * as OpenAPI from '../../core';
import { runAnomalyDetection } from '../../core/analysis/runAnomalyDetection';
import { runAnomalyExploitation } from '../../core/analysis/runAnomalyExploitation';
import { Anomaly, AnomalyDetectionConfig, AnomalyExploitationConfig, AnomalyReport } from '../../core/analysis/types';
import { Context } from '../../core/Context';
import { AvatarSwarmGenerator, calculateDirectoryChecksum, RecommendationEngine, renderApiServerTemplate, renderMicroserviceTemplates, ReportGenerator } from '../../core/microservices';
import { AvatarConfig, SwarmGenerationConfig } from '../../core/microservices/types';
import { HttpClient } from '../../core/types/enums/HttpClient.enum';
import { getOpenApiSpec } from '../../core/utils/getOpenApiSpec';
import { getOutputPaths } from '../../core/utils/getOutputPaths';
import { swarmSchema, TSwarmOptions } from '../schemas/swarm.schema';

export async function swarm(options: OptionValues): Promise<void> {
    try {
        APP_LOGGER.info('🌀 Starting Avatar Swarm Generation...');

        const validationResult = validateZodOptions(swarmSchema, options);
        if (!validationResult.success) {
            APP_LOGGER.error(validationResult.errors.join('\n'));
            process.exit(1);
        }

        const validated = validationResult.data as TSwarmOptions;

        // Load specifications
        const avatarConfigs = await loadAvatarConfigs(validated);
        APP_LOGGER.info(`✓ Loaded ${avatarConfigs.length} service specifications`);

        // Create swarm generation config
        const swarmConfig: SwarmGenerationConfig = {
            specs: avatarConfigs,
            outputDir: validated.output,
            coordinationStrategy: validated.strategy || 'consensus',
            consensusThreshold: validated.consensusThreshold ?? 0.66,
            enableHealthMonitoring: validated.enableHealthMonitoring !== false,
            enablePerformanceProfiling: validated.enablePerformanceProfiling !== false,
            enableAutoOptimization: validated.enableAutoOptimization !== false,
            aiRecommendations: validated.aiRecommendations !== false,
            reportFormat: validated.reportFormat || 'markdown',
            generateApiServer: validated.generateApiServer === true,
        };

        // Generate swarm
        const generator = new AvatarSwarmGenerator();
        const { swarm, analysisResult } = generator.generateSwarm(swarmConfig);
        APP_LOGGER.info(`✓ Generated swarm with ${swarm.avatars.length} avatars`);

        // Generate OpenAPI clients for each avatar
        APP_LOGGER.info('📦 Generating API clients for each avatar...');
        const sharedGenerateOpts = buildSharedGenerateOptions(options);
        for (const avatar of swarm.avatars) {
            const avatarOutput = path.join(validated.output, avatar.name);
            await OpenAPI.generate({
                httpClient: HttpClient.FETCH,
                ...sharedGenerateOpts,
                input: resolveHelper(process.cwd(), avatar.config.specPath),
                output: avatarOutput,
            } as TRawOptions);
            avatar.metadata.checksumCode = calculateDirectoryChecksum(avatarOutput);
            APP_LOGGER.info(`✓ Generated client for ${avatar.name}`);
        }

        // Render microservice coordination templates
        APP_LOGGER.info('🔗 Rendering microservice coordination templates...');
        renderMicroserviceTemplates(swarm, validated.output);
        APP_LOGGER.info('✓ Coordinator and avatar wrappers rendered');

        if (swarmConfig.generateApiServer) {
            const apiServerPort = validated.apiServerPort ?? 3100;
            renderApiServerTemplate(swarm, validated.output, apiServerPort);
            APP_LOGGER.info(`✓ API server rendered on port ${apiServerPort}`);
        }

        // Create coordinator
        APP_LOGGER.info(`✓ Coordinator initialized with ${swarm.rules.length} rules`);

        // Analyze swarm
        APP_LOGGER.info('🔍 Analyzing swarm consistency and data flows...');

        // Detect anomalies
        const logger = APP_LOGGER as unknown as Logger;
        const anomalies: Anomaly[] = [];
        if (shouldRunAnomalyDetection(validated)) {
            for (const avatar of swarm.avatars) {
                const detectionConfig = buildAvatarAnomalyDetectionConfig(validated, avatar.name);
                const report = await runAnomalyDetection(avatar.config.spec, detectionConfig, logger);
                anomalies.push(...report.anomalies);

                if (shouldRunAnomalyExploitation(validated, report)) {
                    const avatarOutput = path.join(validated.output, avatar.name);
                    await runAnomalyExploitation(report, avatarOutput, buildAvatarAnomalyExploitationConfig(validated), logger);
                }
            }
            APP_LOGGER.info(`✓ Detected ${anomalies.length} total anomalies across services`);
        }

        // Generate recommendations
        APP_LOGGER.info('🤖 Generating AI-powered recommendations...');
        const recommendationEngine = new RecommendationEngine();
        const recommendations = recommendationEngine.generateRecommendations({
            avatars: swarm.avatars,
            swarm,
            anomalies,
            performanceMetrics: analysisResult.performanceMetrics,
        });
        APP_LOGGER.info(`✓ Generated ${recommendations.recommendations.length} recommendations ` + `(${recommendations.criticalRecommendations} critical)`);

        // Generate reports
        APP_LOGGER.info('📊 Generating reports...');
        const reportGenerator = new ReportGenerator();
        const reports =
            validated.reportFormat === 'all'
                ? reportGenerator.generateUnifiedReport(swarm, analysisResult, recommendations, 'all')
                : reportGenerator.generateUnifiedReport(swarm, analysisResult, recommendations, validated.reportFormat || 'markdown');

        // Save reports
        await saveReports(reports, validated, swarm.id);
        APP_LOGGER.info('✓ Reports saved successfully');

        // Save swarm metadata
        await saveSwarmMetadata(swarm, validated);
        APP_LOGGER.info('✓ Swarm metadata saved');

        // Output summary
        outputSummary(swarm, recommendations, validated);

        APP_LOGGER.info('✅ Avatar Swarm Generation completed successfully!');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.error(`❌ Error: ${message}`);
        throw error;
    }
}

/**
 * Build a minimal generation context for loading a single spec
 */
function createSpecContext(input: string, output: string): Context {
    return new Context({
        input: resolveHelper(process.cwd(), input),
        output: getOutputPaths({ output }),
    });
}

/**
 * Recursively convert Map instances into plain objects so JSON.stringify
 * does not silently serialize them as empty objects.
 */
function serializeMaps(value: any): any {
    if (value instanceof Map) {
        const result: Record<string, any> = {};
        for (const [key, mapValue] of value.entries()) {
            result[String(key)] = serializeMaps(mapValue);
        }
        return result;
    }
    if (Array.isArray(value)) {
        return value.map(serializeMaps);
    }
    if (value && typeof value === 'object') {
        const result: Record<string, any> = {};
        for (const [key, objValue] of Object.entries(value)) {
            result[key] = serializeMaps(objValue);
        }
        return result;
    }
    return value;
}

/**
 * Load avatar configurations from specs directory or list
 */
async function loadAvatarConfigs(options: TSwarmOptions): Promise<AvatarConfig[]> {
    const configs: AvatarConfig[] = [];

    if (options.specs) {
        // Parse JSON specs list
        const specsList = JSON.parse(options.specs);
        for (const spec of specsList) {
            const specContent = await getOpenApiSpec(createSpecContext(spec.input, options.output), spec.input);
            configs.push({
                name: spec.name,
                specPath: spec.input,
                spec: specContent,
                outputPath: path.join(options.output, spec.name),
                autonomyLevel: spec.autonomyLevel || 'medium',
                roles: spec.roles,
                dependencies: spec.dependencies,
            });
        }
    } else if (options.specsDir) {
        // Load all YAML/JSON files from directory
        const specsDir = options.specsDir;
        if (!fs.existsSync(specsDir)) {
            throw new Error(`Specs directory not found: ${specsDir}`);
        }

        const files = fs.readdirSync(specsDir);
        for (const file of files) {
            if (file.endsWith('.yaml') || file.endsWith('.json') || file.endsWith('.yml')) {
                const specPath = path.join(specsDir, file);
                const name = path.basename(file, path.extname(file));

                const specContent = await getOpenApiSpec(createSpecContext(specPath, options.output), specPath);
                configs.push({
                    name,
                    specPath,
                    spec: specContent,
                    outputPath: path.join(options.output, name),
                    autonomyLevel: 'medium',
                });
            }
        }
    }

    if (configs.length === 0) {
        throw new Error('No specifications found');
    }

    return configs;
}

function shouldRunAnomalyDetection(options: TSwarmOptions): boolean {
    if (options.anomalyExploitation?.enabled === true || options.anomalyDetection?.enabled === true) {
        return true;
    }
    return options.anomalyDetection?.enabled !== false;
}

function shouldRunAnomalyExploitation(options: TSwarmOptions, report: AnomalyReport): boolean {
    if (report.anomalies.length === 0) {
        return false;
    }
    if (options.anomalyExploitation?.enabled === true) {
        return true;
    }
    if (options.anomalyExploitation?.enabled === false) {
        return false;
    }
    return options.enableAutoOptimization !== false;
}

function buildAvatarAnomalyDetectionConfig(options: TSwarmOptions, avatarName: string): AnomalyDetectionConfig {
    return {
        reportFormat: 'json',
        reportPath: path.join(options.output, avatarName, 'anomaly-report.json'),
        ...(options.anomalyDetection ?? {}),
        enabled: true,
    };
}

function buildAvatarAnomalyExploitationConfig(options: TSwarmOptions): AnomalyExploitationConfig {
    return {
        strategy: 'balanced',
        ...(options.anomalyExploitation ?? {}),
        enabled: true,
    };
}

/**
 * Build shared OpenAPI.generate options from swarm CLI flags
 */
function buildSharedGenerateOptions(options: OptionValues): Partial<TRawOptions> {
    const shared: Partial<TRawOptions> = {
        httpClient: (options.httpClient as TRawOptions['httpClient']) || HttpClient.FETCH,
    };
    if (options.useOptions) {
        shared.useOptions = options.useOptions;
    }
    if (options.useUnionTypes) {
        shared.useUnionTypes = options.useUnionTypes;
    }
    return shared;
}

/**
 * Save reports in requested formats
 */
async function saveReports(reports: any, options: TSwarmOptions, swarmId: string): Promise<void> {
    const outputDir = options.output;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    if (options.reportFormat === 'all' && typeof reports === 'object' && 'json' in reports) {
        // Save all formats
        if (reports.json) {
            fs.writeFileSync(path.join(outputDir, `swarm-report-${swarmId}.json`), JSON.stringify(serializeMaps(reports.json), null, 2));
        }
        if (reports.markdown) {
            const md = buildMarkdownFromReport(reports.markdown);
            fs.writeFileSync(path.join(outputDir, `swarm-report-${swarmId}.md`), md);
        }
        if (reports.html && reports.html.htmlDashboard) {
            fs.writeFileSync(path.join(outputDir, `swarm-report-${swarmId}.html`), reports.html.htmlDashboard);
        }
    } else {
        // Save single format
        if (options.reportFormat === 'json' || !options.reportFormat) {
            fs.writeFileSync(path.join(outputDir, `swarm-report-${swarmId}.json`), JSON.stringify(serializeMaps(reports), null, 2));
        } else if (options.reportFormat === 'markdown') {
            const md = buildMarkdownFromReport(reports);
            fs.writeFileSync(path.join(outputDir, `swarm-report-${swarmId}.md`), md);
        } else if (options.reportFormat === 'html' && reports.htmlDashboard) {
            fs.writeFileSync(path.join(outputDir, `swarm-report-${swarmId}.html`), reports.htmlDashboard);
        }
    }
}

/**
 * Build markdown report
 */
function buildMarkdownFromReport(report: any): string {
    let md = `# Avatar Swarm Report\n\n`;
    md += `Generated: ${report.timestamp}\n\n`;

    for (const section of report.sections) {
        md += `## ${section.title}\n\n`;
        if (typeof section.content === 'string') {
            md += section.content + '\n\n';
        } else {
            md += JSON.stringify(section.content, null, 2) + '\n\n';
        }
    }

    return md;
}

/**
 * Save swarm metadata
 */
async function saveSwarmMetadata(swarm: any, options: TSwarmOptions): Promise<void> {
    const metadata = {
        id: swarm.id,
        name: swarm.name,
        createdAt: swarm.metadata.createdAt,
        totalAvatars: swarm.metadata.totalAvatars,
        totalEndpoints: swarm.metadata.totalEndpoints,
        avatars: swarm.avatars.map((a: any) => ({
            id: a.id,
            name: a.name,
            specVersion: a.specVersion,
            capabilities: a.capabilities.length,
        })),
    };

    const metadataPath = path.join(options.output, `.swarm-metadata-${swarm.id}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(serializeMaps(metadata), null, 2));
}

/**
 * Output summary to console
 */
function outputSummary(swarm: any, recommendations: any, options: TSwarmOptions): void {
    console.log('\n' + '='.repeat(60));
    console.log('Avatar Swarm Generation Summary');
    console.log('='.repeat(60));

    console.log(`\n📦 Swarm: ${swarm.name}`);
    console.log(`   ID: ${swarm.id}`);
    console.log(`   Avatars: ${swarm.metadata.totalAvatars}`);
    console.log(`   Endpoints: ${swarm.metadata.totalEndpoints}`);
    console.log(`   Bundle Size: ${(swarm.metadata.estimatedTotalBundleSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Health: ${swarm.healthStatus.overallHealth.toUpperCase()}`);

    console.log(`\n📊 Recommendations:`);
    console.log(`   Total: ${recommendations.recommendations.length}`);
    console.log(`   Critical: ${recommendations.criticalRecommendations}`);
    console.log(`   System Health: ${recommendations.summary.overallSystemHealth}`);

    console.log(`\n📁 Output:`);
    console.log(`   Directory: ${options.output}`);
    console.log(`   Formats: ${options.reportFormat === 'all' ? 'JSON, Markdown, HTML' : options.reportFormat || 'Markdown'}`);

    console.log('\n' + '='.repeat(60) + '\n');
}
