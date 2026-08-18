import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import type { TEslintFixOptions } from '../common/TEslintFixOptions';
import type { TStrictFlatOptions } from '../common/TRawOptions';
import { resolveHelper } from '../common/utils/pathHelpers';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import { finalizeGenerationBatch } from './finalizeGenerationBatch';
import { getSpecItemName } from './generationCache/EntitySkip';
import type { GenerationCache } from './generationCache/GenerationCache';
import type { GenerationRootOptions } from './resolveGenerationOptions';
import type { ReuseStore } from './reuseStore';
import type { GenerationReport } from './reuseStore/GenerationReport';
import { analyzeCrossSpecManifest, writeGenerationReport } from './reuseStore/GenerationReport';
import type { SharedFolderWriter } from './reuseStore/SharedFolderWriter';
import { ReuseConflictError } from './reuseStore/types';
import { setupGenerationBatch } from './setupGenerationBatch';
import type { SpecAnalysisAccumulator } from './specAnalysis/runSpecAnalysis';
import type { WriteClient } from './write/WriteClient';

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
 * Pre-loop bootstrap: setupGenerationBatch. Post-loop: finalizeGenerationBatch.
 * Per-item parse/write runs behind `generateItem`, wired by the facade to GenerationItemSession.
 */
export class GenerationBatchSession {
    constructor(private readonly deps: GenerationBatchSessionDeps) {}

    async run(items: TStrictFlatOptions[], root: GenerationRootOptions): Promise<void> {
        if (items.length === 0) {
            throw new Error(LOGGER_MESSAGES.GENERATION.NO_OPTIONS);
        }
        const { writeClient, generateItem, shouldEntitySkip, eslintFixOptions } = this.deps;
        writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.STARTED(items.length));

        try {
            const setup = await setupGenerationBatch({ writeClient, shouldEntitySkip }, items, root);
            const {
                start,
                cacheEnabled,
                cacheStrategy,
                useReuseStore,
                generationCaches,
                referencedArtifactKeys,
                specStats,
                reuseConflicts,
                reportBasePath,
                sharedFolderWriter,
                state,
            } = setup;

            const buildGenerationReport = (): GenerationReport => {
                const report: GenerationReport = {
                    generatedAt: new Date().toISOString(),
                    generatorVersion: process.env.npm_package_version || 'dev',
                    specs: specStats,
                    reuse: {
                        totalHits: setup.totalReuseHits,
                        totalMisses: setup.totalReuseMisses,
                        conflicts: reuseConflicts,
                    },
                };

                if (setup.reuseStore && items.some(item => resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection)?.crossSpec !== false)) {
                    report.crossSpec = analyzeCrossSpecManifest(setup.reuseStore.getManifest());
                }

                if (state.specQualityReport) {
                    report.specQuality = {
                        ...state.specQualityReport,
                        failOnHighTriggered: state.specQualityReport.summary.high > 0,
                    };
                }

                if (items[0]?.cacheDebug && setup.reuseStore) {
                    report.phases = { manifestLoadMs: setup.manifestLoadMs, manifestSaveMs: state.manifestSaveMs, gcMs: state.gcMs };
                }

                return report;
            };

            for (const option of items) {
                const fileStart = process.hrtime.bigint();
                const generationCache = cacheEnabled && (cacheStrategy === 'entity' || cacheStrategy === 'reuse') ? (generationCaches.get(resolveOutputRoot(option.output)) ?? null) : null;
                let reuseHits = 0;
                let reuseMisses = 0;
                let entitySkipped = false;

                const itemRunContext: ItemRunContext = {
                    reuseStore: useReuseStore ? setup.reuseStore : null,
                    referencedArtifactKeys,
                    sharedFolderWriter: sharedFolderWriter ?? undefined,
                    specAnalysisAccumulator: state.specAnalysisAccumulator,
                    onReuseStat: hit => {
                        if (hit) {
                            reuseHits += 1;
                            setup.totalReuseHits += 1;
                        } else {
                            reuseMisses += 1;
                            setup.totalReuseMisses += 1;
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

                if (entitySkipped && setup.reuseStore) {
                    const manifestItem = setup.reuseStore.getManifest().specItems[getSpecItemName(option.input)];
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
                root,
                allEntitySkipped,
                cacheEnabled,
                cacheStrategy,
                generationCaches,
                reuseStore: setup.reuseStore,
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
}

function resolveOutputRoot(output: string): string {
    return resolveHelper(process.cwd(), output);
}
