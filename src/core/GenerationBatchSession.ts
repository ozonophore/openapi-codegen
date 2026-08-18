import { COMMON_DEFAULT_OPTIONS_VALUES } from '../common/Consts';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import type { TEslintFixOptions } from '../common/TEslintFixOptions';
import type { TRawOptions, TStrictFlatOptions } from '../common/TRawOptions';
import { resolveHelper } from '../common/utils/pathHelpers';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import { finalizeGenerationBatch, type FinalizeGenerationBatchState } from './finalizeGenerationBatch';
import { getSpecItemName } from './generationCache/EntitySkip';
import { ReuseStore } from './reuseStore';
import type { GenerationReport, ReuseConflictRecord, SpecGenerationStats } from './reuseStore/GenerationReport';
import { analyzeCrossSpecManifest, writeGenerationReport } from './reuseStore/GenerationReport';
import { resolveOutputGroups } from './reuseStore/OutputGroupResolver';
import { SharedFolderWriter } from './reuseStore/SharedFolderWriter';
import { ReuseConflictError } from './reuseStore/types';
import { runPreAnalyze } from './specAnalysis/runPreAnalyze';
import { createSpecAnalysisAccumulator, type SpecAnalysisAccumulator } from './specAnalysis/runSpecAnalysis';
import { GenerationCache } from './utils/GenerationCache';
import { getOutputPaths } from './utils/getOutputPaths';
import { isClassesBundleLayout } from './utils/modelsLayoutHelpers';
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
 * Owns the multi-item Generation batch lifecycle (setup → item loop → finalize).
 * Per-item parse/write runs behind `generateItem`, wired by the facade to GenerationItemSession.
 * Post-loop phases live in finalizeGenerationBatch.
 */
export class GenerationBatchSession {
    private static readonly DEFAULT_CACHE_FILENAME = '.openapi-codegen-cache.json';

    constructor(private readonly deps: GenerationBatchSessionDeps) {}

    async run(items: TStrictFlatOptions[], rawOptions: TRawOptions): Promise<void> {
        if (items.length === 0) {
            throw new Error(LOGGER_MESSAGES.GENERATION.NO_OPTIONS);
        }
        const { writeClient, generateItem, shouldEntitySkip, eslintFixOptions } = this.deps;
        writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.STARTED(items.length));

        const state: FinalizeGenerationBatchState = {
            specAnalysisAccumulator: null,
            gcMs: 0,
            manifestSaveMs: 0,
        };

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
            let reportBasePath = this.resolveOutputRoot(items[0]!.output);
            let manifestLoadMs = 0;

            const reuseMode = rawOptions.reuseMode ?? 'copy';
            if (reuseMode === 'auto-group' && cacheStrategy !== 'reuse') {
                writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.AUTO_GROUP_REQUIRES_REUSE_CACHE);
            }

            let sharedFolderWriter: SharedFolderWriter | null = null;
            if (reuseMode === 'auto-group' && useReuseStore) {
                const absoluteOutputPaths = items.map(item => this.resolveOutputRoot(item.output));
                const lca = resolveOutputGroups(absoluteOutputPaths);
                if (lca) {
                    sharedFolderWriter = new SharedFolderWriter(lca);
                } else {
                    writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.AUTO_GROUP_LCA_TRIVIAL_FALLBACK);
                }
            }

            if (items.some(item => resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection)?.enabled)) {
                state.specAnalysisAccumulator = createSpecAnalysisAccumulator();
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

                if (state.specQualityReport) {
                    report.specQuality = {
                        ...state.specQualityReport,
                        failOnHighTriggered: state.specQualityReport.summary.high > 0,
                    };
                }

                if (items[0]?.cacheDebug && reuseStore) {
                    report.phases = { manifestLoadMs, manifestSaveMs: state.manifestSaveMs, gcMs: state.gcMs };
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
                    specAnalysisAccumulator: state.specAnalysisAccumulator,
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
                        if (cacheEnabled || state.specAnalysisAccumulator) {
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

            await finalizeGenerationBatch({
                writeClient,
                eslintFixOptions,
                items,
                rawOptions,
                allEntitySkipped,
                cacheEnabled,
                cacheStrategy,
                generationCaches,
                reuseStore,
                referencedArtifactKeys,
                specStats,
                reportBasePath,
                sharedFolderLca: sharedFolderWriter?.lca,
                buildGenerationReport,
                state,
                start,
            });
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
}
