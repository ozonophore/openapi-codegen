import { promises as fsPromises } from 'fs';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../common/Consts';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import type { TEslintFixOptions } from '../common/TEslintFixOptions';
import type { TRawOptions, TStrictFlatOptions } from '../common/TRawOptions';
import { eslintFixBatch } from '../common/utils/eslintFix';
import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { resolveHelper } from '../common/utils/pathHelpers';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import { AvatarSwarmGenerator } from './avatarSwarm/AvatarSwarmGenerator';
import { writeSwarmOutput } from './avatarSwarm/writeSwarmOutput';
import { getSpecItemName } from './generationCache/EntitySkip';
import { generateTrafficSplitterModule } from './migration/generateTrafficSplitterModule';
import { ReuseStore } from './reuseStore';
import type { GenerationReport, ReuseConflictRecord, SpecGenerationStats } from './reuseStore/GenerationReport';
import { analyzeCrossSpecManifest, writeGenerationReport } from './reuseStore/GenerationReport';
import { resolveOutputGroups } from './reuseStore/OutputGroupResolver';
import { SharedFolderWriter } from './reuseStore/SharedFolderWriter';
import { SHARED_FOLDER_NAME } from './reuseStore/SharedFolderWriter';
import { ReuseConflictError } from './reuseStore/types';
import { runPreAnalyze } from './specAnalysis/runPreAnalyze';
import { createSpecAnalysisAccumulator, finalizeSpecAnalysis, mergeSpecAnalysisConfigAcrossItems, type SpecAnalysisAccumulator } from './specAnalysis/runSpecAnalysis';
import type { SpecAnalysisReport } from './specAnalysis/types';
import { GenerationCache } from './utils/GenerationCache';
import { getOutputPaths } from './utils/getOutputPaths';
import { isClassesBundleLayout } from './utils/modelsLayoutHelpers';
import { buildWorkspaceReport } from './workspaceReport/buildWorkspaceReport';
import { writeWorkspaceReport } from './workspaceReport/writeWorkspaceReport';
import type { WriteClient } from './WriteClient';

export type ItemRunContext = {
    reuseStore: ReuseStore | null;
    referencedArtifactKeys: Set<string>;
    onReuseStat?: (hit: boolean) => void;
    sharedFolderWriter?: SharedFolderWriter;
    specAnalysisAccumulator: SpecAnalysisAccumulator | null;
};

export type GenerationBatchSessionDeps = {
    writeClient: WriteClient;
    eslintFixOptions: TEslintFixOptions;
    generateItem: (item: TStrictFlatOptions, generationCache: GenerationCache | null, itemRunContext: ItemRunContext) => Promise<{ entitySkipped: boolean }>;
    shouldEntitySkip: (item: TStrictFlatOptions, generationCache: GenerationCache | null, reuseStore: ReuseStore | null) => Promise<boolean>;
};

/**
 * Owns the multi-item Generation batch lifecycle (setup → finalize → ESLint).
 * Per-item parse/write stays behind `generateItem` on the facade.
 */
export class GenerationBatchSession {
    private static readonly DEFAULT_CACHE_FILENAME = '.openapi-codegen-cache.json';

    constructor(private readonly deps: GenerationBatchSessionDeps) {}

    async run(items: TStrictFlatOptions[], rawOptions: TRawOptions): Promise<void> {
        if (items.length === 0) {
            throw new Error(LOGGER_MESSAGES.GENERATION.NO_OPTIONS);
        }
        const { writeClient, generateItem, shouldEntitySkip } = this.deps;
        writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.STARTED(items.length));

        let specAnalysisAccumulator: SpecAnalysisAccumulator | null = null;

        try {
            const start = process.hrtime.bigint();
            this.validateConsistentCacheSettings(items);
            const cacheEnabled = items[0]?.cache === true;
            const cacheStrategy = items[0]?.cacheStrategy ?? COMMON_DEFAULT_OPTIONS_VALUES.cacheStrategy;
            const useReuseStore = cacheEnabled && cacheStrategy === 'reuse';
            const generationCaches = new Map<string, GenerationCache>();
            let reuseStore: ReuseStore | null = null;
            const referencedArtifactKeys = new Set<string>();
            const specStats: SpecGenerationStats[] = [];
            const reuseConflicts: ReuseConflictRecord[] = [];
            let totalReuseHits = 0;
            let totalReuseMisses = 0;
            let specQualityReport: SpecAnalysisReport | undefined;
            let reportBasePath = this.resolveOutputRoot(items[0]!.output);
            let manifestLoadMs = 0;
            let manifestSaveMs = 0;
            let gcMs = 0;

            const reuseMode = rawOptions.reuseMode ?? 'copy';
            if (reuseMode === 'auto-group' && cacheStrategy !== 'reuse') {
                writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.AUTO_GROUP_REQUIRES_REUSE_CACHE);
            }

            let sharedFolderWriter: SharedFolderWriter | null = null;
            if (reuseMode === 'auto-group' && useReuseStore) {
                const absoluteOutputPaths = items.map(item => this.resolveOutputRoot(item.output));
                const lca = resolveOutputGroups(absoluteOutputPaths);
                if (lca) {
                    sharedFolderWriter = new SharedFolderWriter(writeClient, lca);
                } else {
                    writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.AUTO_GROUP_LCA_TRIVIAL_FALLBACK);
                }
            }

            if (items.some(item => resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection)?.enabled)) {
                specAnalysisAccumulator = createSpecAnalysisAccumulator();
            }

            if (!cacheEnabled) {
                this.warnOnSharedOutputs(items);
            } else if (useReuseStore) {
                this.warnOnSharedCoreServiceOutputs(items, !!sharedFolderWriter);
                reuseStore = new ReuseStore(this.resolveReuseStorePath(items[0]!.cachePath));
                const loadStart = process.hrtime.bigint();
                await reuseStore.load();
                manifestLoadMs = Number(process.hrtime.bigint() - loadStart) / 1e6;
                reportBasePath = reuseStore.getRootPath();
                if (items.some(item => isClassesBundleLayout(item.modelsMode, item.modelsLayout))) {
                    writeClient.logger.warn('ReuseStore is disabled for modelsMode=classes with layout=bundle; falling back to entity cache for those items');
                }
            }

            if (cacheEnabled && (cacheStrategy === 'entity' || cacheStrategy === 'reuse')) {
                for (const outputRoot of this.getUniqueResolvedOutputs(items)) {
                    const sampleItem = items.find(item => this.resolveOutputRoot(item.output) === outputRoot);
                    if (!sampleItem) {
                        continue;
                    }
                    const cachePath =
                        cacheStrategy === 'reuse'
                            ? resolveHelper(this.resolveOutputRoot(sampleItem.output), GenerationBatchSession.DEFAULT_CACHE_FILENAME)
                            : this.resolveCachePathForOutput(sampleItem.output, sampleItem.cachePath);
                    const generationCache = new GenerationCache(cachePath);
                    await generationCache.load();
                    generationCaches.set(outputRoot, generationCache);
                }
            } else if (cacheEnabled && cacheStrategy === 'content' && items[0]?.cacheDebug) {
                writeClient.logger.info('cacheStrategy: content — relying on writeFileIfChanged only');
            }

            const buildGenerationReport = (): GenerationReport => {
                const report: GenerationReport = {
                    generatedAt: new Date().toISOString(),
                    generatorVersion: process.env.npm_package_version || 'dev',
                    specs: specStats,
                    reuse: {
                        totalHits: totalReuseHits,
                        totalMisses: totalReuseMisses,
                        conflicts: reuseConflicts,
                    },
                };

                if (reuseStore && items.some(item => resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection)?.crossSpec !== false)) {
                    report.crossSpec = analyzeCrossSpecManifest(reuseStore.getManifest());
                }

                if (specQualityReport) {
                    report.specQuality = {
                        ...specQualityReport,
                        failOnHighTriggered: specQualityReport.summary.high > 0,
                    };
                }

                if (items[0]?.cacheDebug && reuseStore) {
                    report.phases = { manifestLoadMs, manifestSaveMs, gcMs };
                }

                return report;
            };

            const resolveItemGenerationCache = (option: TStrictFlatOptions): GenerationCache | null =>
                cacheEnabled && (cacheStrategy === 'entity' || cacheStrategy === 'reuse') ? (generationCaches.get(this.resolveOutputRoot(option.output)) ?? null) : null;

            if (rawOptions.preAnalyze === true) {
                const willEntitySkipSpecItems = new Set<string>();
                for (const option of items) {
                    const generationCache = resolveItemGenerationCache(option);
                    if (await shouldEntitySkip(option, generationCache, useReuseStore ? reuseStore : null)) {
                        willEntitySkipSpecItems.add(getSpecItemName(option.input));
                    }
                }
                const itemsForPreAnalyze = items.filter(item => !willEntitySkipSpecItems.has(getSpecItemName(item.input)));
                if (itemsForPreAnalyze.length === 0) {
                    writeClient.logger.forceInfo('[preAnalyze] Skipped — all items entity-cached');
                } else {
                    await runPreAnalyze(itemsForPreAnalyze, writeClient.logger);
                }
            }

            for (const option of items) {
                const fileStart = process.hrtime.bigint();
                const generationCache = resolveItemGenerationCache(option);
                let reuseHits = 0;
                let reuseMisses = 0;
                let entitySkipped = false;

                const itemRunContext: ItemRunContext = {
                    reuseStore: useReuseStore ? reuseStore : null,
                    referencedArtifactKeys,
                    sharedFolderWriter: sharedFolderWriter ?? undefined,
                    specAnalysisAccumulator,
                    onReuseStat: hit => {
                        if (hit) {
                            reuseHits += 1;
                            totalReuseHits += 1;
                        } else {
                            reuseMisses += 1;
                            totalReuseMisses += 1;
                        }
                    },
                };

                try {
                    ({ entitySkipped } = await generateItem(option, generationCache, itemRunContext));
                } catch (error) {
                    if (error instanceof ReuseConflictError) {
                        reuseConflicts.push({
                            ...error.details,
                            timestamp: new Date().toISOString(),
                        });
                        if (cacheEnabled || specAnalysisAccumulator) {
                            await writeGenerationReport(reportBasePath, buildGenerationReport());
                        }
                    }
                    throw error;
                }

                if (entitySkipped && reuseStore) {
                    const manifestItem = reuseStore.getManifest().specItems[getSpecItemName(option.input)];
                    for (const artifactKey of manifestItem?.artifactKeys ?? []) {
                        referencedArtifactKeys.add(artifactKey);
                    }
                }

                const fileEnd = process.hrtime.bigint();
                const fileDurationInSeconds = Number(fileEnd - fileStart) / 1e9;
                specStats.push({
                    specItem: getSpecItemName(option.input),
                    input: option.input,
                    durationMs: Math.round(fileDurationInSeconds * 1000),
                    reuseHits,
                    reuseMisses,
                    entitySkipped,
                });
                writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.DURATION_FOR_FILE(option.input, fileDurationInSeconds.toFixed(3)));
            }

            const allEntitySkipped = specStats.length > 0 && specStats.every(entry => entry.entitySkipped);

            if (!allEntitySkipped) {
                if (items[0]?.useSeparatedIndexes) {
                    await writeClient.combineAndWrightSimple();
                } else {
                    await writeClient.combineAndWrite();
                }
            }

            const trafficSplitterConfig = rawOptions.trafficSplitter;
            const trafficSplitterEnabled = trafficSplitterConfig && typeof trafficSplitterConfig === 'object' ? trafficSplitterConfig.enabled : trafficSplitterConfig === true;
            if (trafficSplitterEnabled) {
                if (items.length > 1) {
                    writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.TRAFFIC_SPLITTER_MULTI_ITEM_WARN);
                }
                const cfg = typeof trafficSplitterConfig === 'object' ? trafficSplitterConfig : {};
                const firstItemOutput = items[0]?.output ?? '.';
                try {
                    await generateTrafficSplitterModule(cfg, firstItemOutput);
                } catch (err: any) {
                    writeClient.logger.warn(`trafficSplitter: failed to generate module — ${err.message}`);
                }
            }

            const swarmConfig = rawOptions.swarm;
            const swarmEnabled = swarmConfig && typeof swarmConfig === 'object' ? swarmConfig.enabled : swarmConfig === true;
            if (swarmEnabled) {
                const cfg = typeof swarmConfig === 'object' ? swarmConfig : {};
                try {
                    const generator = new AvatarSwarmGenerator();
                    const manifest = generator.build(items, specStats, reuseStore);
                    await writeSwarmOutput(manifest, cfg);
                } catch (err: any) {
                    writeClient.logger.warn(`swarm: failed to generate manifest — ${err.message}`);
                }
            }

            await this.cleanupStaleOutputs(items, sharedFolderWriter?.lca);
            if (cacheEnabled && (cacheStrategy === 'entity' || cacheStrategy === 'reuse')) {
                for (const generationCache of generationCaches.values()) {
                    await generationCache.save();
                }
            }
            if (specAnalysisAccumulator && !allEntitySkipped) {
                const crossSpecItems = items.map(item => ({
                    name: getSpecItemName(item.input),
                    input: item.input,
                    outputModels: item.outputModels,
                    outputSchemas: item.outputSchemas,
                }));
                const mergedSpecAnalysis = mergeSpecAnalysisConfigAcrossItems(
                    items.map(item => {
                        const resolved = resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection);
                        return resolved ? { ...resolved, enabled: resolved.enabled ?? true } : undefined;
                    })
                );
                specQualityReport = await finalizeSpecAnalysis(specAnalysisAccumulator, crossSpecItems, mergedSpecAnalysis, writeClient.logger, reuseStore?.getManifest());
                specAnalysisAccumulator = null;
            } else if (specAnalysisAccumulator && allEntitySkipped) {
                specAnalysisAccumulator = null;
            }

            if (reuseStore) {
                const gcStart = process.hrtime.bigint();
                await reuseStore.gc(referencedArtifactKeys);
                gcMs = Number(process.hrtime.bigint() - gcStart) / 1e6;
                if (reuseStore.isDirty()) {
                    const saveStart = process.hrtime.bigint();
                    await reuseStore.save();
                    manifestSaveMs = Number(process.hrtime.bigint() - saveStart) / 1e6;
                }
            }

            if (cacheEnabled || specQualityReport) {
                await writeGenerationReport(reportBasePath, buildGenerationReport());
            }

            const workspaceReportConfig = rawOptions.workspaceReport;
            const workspaceReportEnabled = workspaceReportConfig && typeof workspaceReportConfig === 'object' ? workspaceReportConfig.enabled : workspaceReportConfig === true;
            if (workspaceReportEnabled) {
                const cfg = typeof workspaceReportConfig === 'object' ? workspaceReportConfig : {};
                try {
                    const report = buildWorkspaceReport(specStats, reuseStore);
                    await writeWorkspaceReport(report, cfg);
                } catch (err: any) {
                    writeClient.logger.warn(`workspaceReport: failed to write report — ${err.message}`);
                }
            }

            const writeStats = writeClient.getWriteStats();
            writeClient.logger.info(LOGGER_MESSAGES.GENERATION.WRITE_STATS(writeStats.written, writeStats.unchanged));

            if (!allEntitySkipped) {
                await this.runBatchEslintFixIfEnabled();
            } else {
                writeClient.clearLintTargets();
            }

            writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.FINISHED);
            const end = process.hrtime.bigint();
            const durationInSeconds = Number(end - start) / 1e9;
            writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.FINISHED_WITH_DURATION(durationInSeconds.toFixed(3)));
        } catch (error: any) {
            writeClient.logger.error(LOGGER_MESSAGES.ERROR.GENERIC(error.message));
            throw error;
        }

        writeClient.logger.shutdownLogger();
    }

    private getUniqueResolvedOutputs(items: TStrictFlatOptions[]): string[] {
        return Array.from(new Set(items.map(item => this.resolveOutputRoot(item.output))));
    }

    private resolveOutputRoot(output: string): string {
        return resolveHelper(process.cwd(), output);
    }

    private resolveReuseStorePath(cachePath: string): string {
        if (cachePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(cachePath)) {
            return cachePath;
        }
        return resolveHelper(process.cwd(), cachePath || '.openapi-codegen-store');
    }

    private resolveCachePathForOutput(output: string, cachePath: string): string {
        if (cachePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(cachePath)) {
            return cachePath;
        }
        return resolveHelper(this.resolveOutputRoot(output), cachePath || GenerationBatchSession.DEFAULT_CACHE_FILENAME);
    }

    private validateConsistentCacheSettings(items: TStrictFlatOptions[]): void {
        if (items.length <= 1) {
            return;
        }

        const first = items[0]!;
        for (const item of items.slice(1)) {
            if (item.modelsMode !== first.modelsMode) {
                this.deps.writeClient.logger.warn(
                    `modelsMode differs between "${first.input}" (${first.modelsMode}) and "${item.input}" (${item.modelsMode}). ` +
                        `This may cause unexpected cache behavior when cacheStrategy is "reuse".`
                );
            }
        }
    }

    private warnOnSharedOutputs(items: TStrictFlatOptions[]): void {
        const countByOutput = new Map<string, number>();
        for (const item of items) {
            const output = this.resolveOutputRoot(item.output);
            countByOutput.set(output, (countByOutput.get(output) ?? 0) + 1);
        }
        const duplicatedOutputs = Array.from(countByOutput.entries())
            .filter(([, count]) => count > 1)
            .map(([output]) => output);

        if (duplicatedOutputs.length === 0) {
            return;
        }

        this.deps.writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.CACHE_SHARED_OUTPUT_WARNING(duplicatedOutputs.map(output => `- ${output}`).join('\n')));
    }

    private warnOnSharedCoreServiceOutputs(items: TStrictFlatOptions[], sharedCoreActive = false): void {
        const countByPath = new Map<string, Set<string>>();
        for (const item of items) {
            const paths = getOutputPaths({
                output: item.output,
                outputCore: item.outputCore,
                outputServices: item.outputServices,
                outputModels: item.outputModels,
                outputSchemas: item.outputSchemas,
            });
            for (const pathKey of ['outputCore' as const, 'outputServices' as const]) {
                const resolved = paths[pathKey];
                if (!countByPath.has(resolved)) {
                    countByPath.set(resolved, new Set());
                }
                countByPath.get(resolved)!.add(getSpecItemName(item.input));
            }
        }

        const collisions = Array.from(countByPath.entries()).filter(([, specs]) => specs.size > 1);
        if (collisions.length === 0) {
            return;
        }

        const details = collisions.map(([path, specs]) => `- ${path}: ${Array.from(specs).join(', ')}`).join('\n');
        this.deps.writeClient.logger.warn(
            sharedCoreActive ? LOGGER_MESSAGES.GENERATION.SHARED_CORE_SERVICES_PATH_COLLISION(details) : LOGGER_MESSAGES.GENERATION.SHARED_CORE_SERVICES_PATH_COLLISION_MODELS_ONLY(details)
        );
    }

    private getOutputRoots(items: TStrictFlatOptions[]): string[] {
        const roots = new Set<string>();
        for (const item of items) {
            const outputDirs = [item.output, item.outputCore, item.outputSchemas, item.outputModels, item.outputServices];
            for (const dir of outputDirs) {
                if (dir) {
                    roots.add(resolveHelper(process.cwd(), dir));
                }
            }
        }
        return Array.from(roots);
    }

    private async cleanupStaleOutputs(items: TStrictFlatOptions[], sharedFolderLca?: string): Promise<void> {
        const outputRoots = this.getOutputRoots(items);
        if (sharedFolderLca) {
            outputRoots.push(resolveHelper(sharedFolderLca, SHARED_FOLDER_NAME));
        }
        const expectedFiles = this.deps.writeClient.getExpectedOutputFiles();

        for (const root of outputRoots) {
            await this.removeStaleFilesInDirectory(root, expectedFiles);
        }
    }

    private async removeStaleFilesInDirectory(path: string, expectedFiles: Set<string>): Promise<boolean> {
        const stats = await fsPromises.stat(path).catch(() => null);
        if (!stats) {
            return false;
        }

        if (stats.isFile()) {
            if (!expectedFiles.has(path)) {
                await fileSystemHelpers.rmdir(path);
                return false;
            }
            return true;
        }

        const entries = await fsPromises.readdir(path);
        let hasAnyFile = false;

        for (const entry of entries) {
            const childPath = resolveHelper(path, entry);
            const childHasFiles = await this.removeStaleFilesInDirectory(childPath, expectedFiles);
            hasAnyFile = hasAnyFile || childHasFiles;
        }

        if (!hasAnyFile) {
            await fileSystemHelpers.rmdir(path);
            return false;
        }

        return true;
    }

    private async runBatchEslintFixIfEnabled(): Promise<void> {
        const { writeClient, eslintFixOptions: opts } = this.deps;
        const hasTsconfig = !!opts.tsconfigPath;
        const hasEslintConfig = !!opts.eslintConfigPath;

        if (!hasTsconfig && !hasEslintConfig) {
            writeClient.clearLintTargets();
            return;
        }

        if (!hasTsconfig || !hasEslintConfig) {
            writeClient.logger.warn(LOGGER_MESSAGES.FORMATTING.ESLINT_PATHS_MISSING);
            writeClient.clearLintTargets();
            return;
        }

        try {
            const { files, includeGlobs } = writeClient.getLintTargets();
            if (files.length === 0) {
                return;
            }

            const fixStart = process.hrtime.bigint();
            writeClient.logger.forceInfo(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_STARTED);

            await eslintFixBatch({
                files,
                includeGlobs,
                tsconfigPath: opts.tsconfigPath!,
                eslintConfigPath: opts.eslintConfigPath!,
            });

            const fixEnd = process.hrtime.bigint();
            const durationInSeconds = Number(fixEnd - fixStart) / 1e9;
            writeClient.logger.forceInfo(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_FINISHED(durationInSeconds.toFixed(3)));
        } finally {
            writeClient.clearLintTargets();
        }
    }
}
