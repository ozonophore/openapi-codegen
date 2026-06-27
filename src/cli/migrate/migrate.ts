import { OptionValues } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

import { APP_LOGGER } from '../../common/Consts';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { extractBreakingChangesFromDiffReport } from '../../core/migration/extractBreakingChangesFromDiffReport';
import { extractRenameMiraclesFromDiffReport } from '../../core/migration/extractRenameMiraclesFromDiffReport';
import { formatRenameMiraclesForGuide } from '../../core/migration/formatRenameMiraclesForGuide';
import { generateTrafficSplitterModule } from '../../core/migration/generateTrafficSplitterModule';
import { GradualMigrationPlanner } from '../../core/migration/GradualMigrationPlanner';
import { generateMigrationRuntimeHelper } from '../../core/migration/MigrationRuntimeGenerator';
import type { MiracleEntry } from '../../core/types/shared/Miracle.model';
import { loadDiffReport } from '../../core/utils/loadDiffReport';
import { migrateSchema, TMigrateOptions } from '../schemas/migrate.schema';

/**
 * Handle the migrate command
 */
export async function migrate(options: OptionValues): Promise<void> {
    try {
        // Validate options - result contains validated data when successful
        const validationResult = validateZodOptions(migrateSchema, options);
        if (!validationResult.success) {
            APP_LOGGER.error(validationResult.errors.join('\n'));
            process.exit(1);
        }

        const validatedOptions = validationResult.data as TMigrateOptions;

        const logger = APP_LOGGER;
        logger.info('Starting gradual migration planning...');

        // Create migration planner
        const planner = new GradualMigrationPlanner();

        // Parse phase count from string if needed
        const phaseCount = typeof validatedOptions.phaseCount === 'string' ? parseInt(validatedOptions.phaseCount, 10) : validatedOptions.phaseCount || 4;

        const loadedDiffReport = validatedOptions.diffReport
            ? loadDiffReport({
                  diffReport: validatedOptions.diffReport,
                  logger,
              })
            : null;
        const breakingChanges = loadedDiffReport ? extractBreakingChangesFromDiffReport(loadedDiffReport) : undefined;

        if (breakingChanges?.length) {
            logger.info(`Loaded diff report: ${breakingChanges.length} breaking change(s) detected`);
        }

        // Plan migration
        const plan = planner.planMigration(
            validatedOptions.fromClient,
            validatedOptions.toClient,
            {
                enabled: true,
                strategy: (validatedOptions.strategy as any) || 'canary',
                phaseCount,
                phaseDuration: validatedOptions.phaseDuration || '1h',
                checkpointFrequency: validatedOptions.checkpointFrequency || '15m',
                rollbackThreshold: typeof validatedOptions.rollbackThreshold === 'string' ? parseInt(validatedOptions.rollbackThreshold, 10) : validatedOptions.rollbackThreshold || 5,
                enableMonitoring: validatedOptions.enableMonitoring !== false,
                enableMetrics: validatedOptions.enableMetrics !== false,
            },
            breakingChanges
        );

        logger.info(`✓ Migration plan created (Strategy: ${plan.strategy})`);

        // Generate output
        const output = generateMigrationReport(plan);

        // Save report if requested
        if (validatedOptions.outputFile) {
            const outputPath = path.resolve(process.cwd(), validatedOptions.outputFile);
            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
            logger.info(`✓ Migration plan saved to: ${outputPath}`);
        }

        // Output to console
        if (validatedOptions.format === 'markdown') {
            console.log(formatMigrationPlanAsMarkdown(output));
        } else {
            console.log(JSON.stringify(output, null, 2));
        }

        // Generate migration guide
        if (validatedOptions.generateGuide !== false) {
            const renameMiracles = loadedDiffReport ? extractRenameMiraclesFromDiffReport(loadedDiffReport) : [];
            const guide = generateMigrationGuide(output, validatedOptions, renameMiracles);
            const guidePath = path.resolve(process.cwd(), validatedOptions.guidePath || 'MIGRATION_GUIDE.md');
            fs.mkdirSync(path.dirname(guidePath), { recursive: true });
            fs.writeFileSync(guidePath, guide);
            logger.info(`✓ Migration guide saved to: ${guidePath}`);
        }

        // Generate migration runtime helper (TrafficSplitter wrapper client)
        const runtimeHelperPath = path.resolve(process.cwd(), validatedOptions.runtimeHelperPath || 'migration-runtime-client.ts');
        const trafficSplitterPath = path.resolve(path.dirname(runtimeHelperPath), 'TrafficSplitter.ts');
        const trafficSplitterCode = generateTrafficSplitterModule();
        fs.mkdirSync(path.dirname(trafficSplitterPath), { recursive: true });
        fs.writeFileSync(trafficSplitterPath, trafficSplitterCode);
        logger.info(`✓ TrafficSplitter module saved to: ${trafficSplitterPath}`);

        const runtimeHelperCode = generateMigrationRuntimeHelper({
            fromClient: validatedOptions.fromClient,
            toClient: validatedOptions.toClient,
            plan,
        });
        fs.mkdirSync(path.dirname(runtimeHelperPath), { recursive: true });
        fs.writeFileSync(runtimeHelperPath, runtimeHelperCode);
        logger.info(`✓ Migration runtime helper saved to: ${runtimeHelperPath}`);

        logger.info('✓ Gradual migration plan completed successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.error(`Migration planning failed: ${message}`);
        throw error;
    }
}

/**
 * Generate migration report
 */
function generateMigrationReport(plan: any): any {
    return {
        plan,
        preflightChecklist: {
            critical: plan.preflightChecks.filter((c: any) => c.critical),
            optional: plan.preflightChecks.filter((c: any) => !c.critical),
        },
        timeline: {
            estimatedDuration: plan.estimatedDuration,
            phases: plan.phases.length,
            startTime: new Date().toISOString(),
        },
        rollbackInstructions: plan.rollbackPlan,
        validationChecks: plan.postMigrationValidation,
        recommendations: [
            'Run all preflight checks before starting migration',
            'Monitor metrics continuously during migration',
            'Have a runbook ready for quick rollback if needed',
            'Communicate timeline to all stakeholders',
        ],
    };
}

/**
 * Format migration plan as Markdown
 */
function formatMigrationPlanAsMarkdown(report: any): string {
    const { plan } = report;
    let md = '# Gradual Migration Plan\n\n';

    md += `**Generated:** ${new Date().toISOString()}\n`;
    md += `**Strategy:** ${plan.strategy}\n`;
    md += `**Estimated Duration:** ${plan.estimatedDuration}\n\n`;

    // Preflight checks
    md += '## Pre-migration Checklist\n\n';
    md += '### Critical Checks\n';
    for (const check of report.preflightChecklist.critical) {
        md += `- [ ] **${check.name}**: ${check.description}\n`;
        if (check.command) md += `  - Run: \`${check.command}\`\n`;
    }
    md += '\n### Optional Checks\n';
    for (const check of report.preflightChecklist.optional) {
        md += `- [ ] ${check.name}: ${check.description}\n`;
    }

    // Migration phases
    md += '\n## Migration Phases\n\n';
    for (let i = 0; i < plan.phases.length; i++) {
        const phase = plan.phases[i];
        md += `### Phase ${i + 1}: ${phase.name}\n`;
        md += `- **Duration:** ${phase.duration}\n`;
        md += `- **Old Client Traffic:** ${(phase.traffic.old * 100).toFixed(0)}%\n`;
        md += `- **New Client Traffic:** ${(phase.traffic.new * 100).toFixed(0)}%\n`;

        if (phase.checkpoints && phase.checkpoints.length > 0) {
            md += '- **Checkpoints:**\n';
            for (const checkpoint of phase.checkpoints) {
                md += `  - ${checkpoint}\n`;
            }
        }

        if (phase.rollbackCondition) {
            md += `- **Rollback Condition:** ${phase.rollbackCondition}\n`;
        }
        md += '\n';
    }

    // Rollback plan
    md += '## Rollback Plan\n\n';
    md += `**Strategy:** ${plan.rollbackPlan.strategy}\n`;
    md += `**Recovery Time:** ${plan.rollbackPlan.recoveryTime}\n\n`;
    md += '### Triggers\n';
    for (const trigger of plan.rollbackPlan.triggers) {
        md += `- ${trigger}\n`;
    }

    // Post-migration validation
    md += '\n## Post-migration Validation\n\n';
    for (const check of report.validationChecks) {
        md += `### ${check.name}\n`;
        md += `${check.description}\n`;
        md += `**Success Criteria:** ${check.successCriteria}\n\n`;
    }

    // Recommendations
    md += '## Recommendations\n\n';
    for (const rec of report.recommendations) {
        md += `- ${rec}\n`;
    }

    return md;
}

/**
 * Generate detailed migration guide
 */
function generateMigrationGuide(report: any, options: any, renameMiracles: MiracleEntry[] = []): string {
    const { plan } = report;
    const monitoringEnabled = options.enableMonitoring !== false;
    let guide = '# Migration Guide: ' + options.fromClient + ' → ' + options.toClient + '\n\n';

    guide += 'Table of Contents\n';
    guide += '1. [Overview](#overview)\n';
    guide += '2. [Pre-migration](#pre-migration)\n';
    guide += '3. [Migration Steps](#migration-steps)\n';
    if (monitoringEnabled) {
        guide += '4. [Monitoring](#monitoring)\n';
    }
    guide += `${monitoringEnabled ? '5' : '4'}. [Rollback](#rollback)\n`;
    guide += `${monitoringEnabled ? '6' : '5'}. [Post-migration](#post-migration)\n\n`;

    guide += '## Overview\n\n';
    guide += `This guide describes the gradual migration from **${options.fromClient}** to **${options.toClient}** client.\n\n`;
    guide += `- **Strategy:** ${plan.strategy}\n`;
    guide += `- **Total Duration:** ${plan.estimatedDuration}\n`;
    guide += `- **Number of Phases:** ${plan.phases.length}\n\n`;

    const renameSection = formatRenameMiraclesForGuide(renameMiracles);
    if (renameSection) {
        guide += renameSection;
    }

    guide += '## Pre-migration\n\n';
    guide += 'Before starting the migration, complete these checks:\n\n';
    for (const check of plan.preflightChecks) {
        guide += `### ${check.name}\n\n`;
        guide += `${check.description}\n\n`;
        if (check.command) {
            guide += '```bash\n';
            guide += check.command + '\n';
            guide += '```\n\n';
        }
        guide += `**Critical:** ${check.critical ? 'Yes' : 'No'}\n\n`;
    }

    guide += '## Migration Steps\n\n';
    for (let i = 0; i < plan.phases.length; i++) {
        const phase = plan.phases[i];
        guide += `### Phase ${i + 1}: ${phase.name}\n\n`;
        guide += `**Duration:** ${phase.duration}\n`;
        guide += `**Traffic Split:** ${(phase.traffic.old * 100).toFixed(0)}% → ${(phase.traffic.new * 100).toFixed(0)}%\n\n`;

        if (phase.checkpoints) {
            guide += 'Checkpoints:\n';
            for (const checkpoint of phase.checkpoints) {
                guide += `- ${checkpoint}\n`;
            }
            guide += '\n';
        }

        if (phase.rollbackCondition) {
            guide += `**Rollback Trigger:** ${phase.rollbackCondition}\n\n`;
        }
    }

    if (monitoringEnabled) {
        guide += '## Monitoring\n\n';
        guide += 'Monitor these metrics during migration:\n\n';
        for (const check of report.validationChecks) {
            guide += `- **${check.name}:** ${check.successCriteria}\n`;
        }
        guide += '\n';
    }

    guide += '## Rollback\n\n';
    guide += `If migration issues arise, follow this rollback procedure:\n\n`;
    guide += '1. Identify the trigger condition\n';
    for (const trigger of plan.rollbackPlan.triggers) {
        guide += `   - ${trigger}\n`;
    }
    guide += '\n2. Execute rollback (estimated time: ' + plan.rollbackPlan.recoveryTime + ')\n';
    guide += '3. Verify data consistency:\n';
    for (const check of plan.rollbackPlan.dataConsistencyChecks) {
        guide += `   - ${check}\n`;
    }

    guide += '\n## Post-migration\n\n';
    guide += 'After successful migration:\n\n';
    for (const check of report.validationChecks) {
        guide += `- [ ] ${check.name}: ${check.successCriteria}\n`;
    }

    return guide;
}
