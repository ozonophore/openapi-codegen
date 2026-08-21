import { COMMON_DEFAULT_OPTIONS_VALUES } from '../common/Consts';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import type { TStrictFlatOptions } from '../common/TRawOptions';
import { resolveHelper } from '../common/utils/pathHelpers';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import type { FinalizeGenerationBatchState } from './finalizeGenerationBatch';
import { getSpecItemName } from './generationCache/EntitySkip';
import { GenerationCache } from './generationCache/GenerationCache';
import type { GenerationRootOptions } from './resolveGenerationOptions';
import { ReuseStore } from './reuseStore';
import type { ReuseConflictRecord, SpecGenerationStats } from './reuseStore/GenerationReport';
import { resolveOutputGroups } from './reuseStore/OutputGroupResolver';
import { SharedFolderWriter } from './reuseStore/SharedFolderWriter';
import { runPreAnalyze } from './specAnalysis/runPreAnalyze';
import { createSpecAnalysisAccumulator } from './specAnalysis/runSpecAnalysis';
import { getOutputPaths } from './utils/getOutputPaths';
import { isClassesBundleLayout } from './utils/modelsLayoutHelpers';
import type { WriteClient } from './write/WriteClient';

const DEFAULT_CACHE_FILENAME = '.openapi-codegen-cache.json';

export type SetupGenerationBatchDeps = {
    writeClient: WriteClient;
    shouldEntitySkip: (item: TStrictFlatOptions, generationCache: GenerationCache | null, reuseStore: ReuseStore | null) => Promise<boolean>;
};

export type SetupGenerationBatchResult = {
    start: bigint;
    cacheEnabled: boolean;
    cacheStrategy: string;
    useReuseStore: boolean;
    generationCaches: Map<string, GenerationCache>;
    reuseStore: ReuseStore | null;
    referencedArtifactKeys: Set<string>;
    specStats: SpecGenerationStats[];
    totalReuseHits: number;
    totalReuseMisses: number;
    reuseConflicts: ReuseConflictRecord[];
    reportBasePath: string;
    manifestLoadMs: number;
    sharedFolderWriter: SharedFolderWriter | null;
    state: FinalizeGenerationBatchState;
};

/**
 * Pre-item-loop generation batch bootstrap (cache/reuse/sharedFolder/preAnalyze).
 */
export async function setupGenerationBatch(deps: SetupGenerationBatchDeps, items: TStrictFlatOptions[], root: GenerationRootOptions): Promise<SetupGenerationBatchResult> {
    const { writeClient, shouldEntitySkip } = deps;
    const start = process.hrtime.bigint();
    validateConsistentCacheSettings(writeClient, items);

    const cacheEnabled = items[0]?.cache === true;
    const cacheStrategy = items[0]?.cacheStrategy ?? COMMON_DEFAULT_OPTIONS_VALUES.cacheStrategy;
    const useReuseStore = cacheEnabled && cacheStrategy === 'reuse';
    const generationCaches = new Map<string, GenerationCache>();
    let reuseStore: ReuseStore | null = null;
    const referencedArtifactKeys = new Set<string>();
    const specStats: SpecGenerationStats[] = [];
    const reuseConflicts: ReuseConflictRecord[] = [];
    let reportBasePath = resolveOutputRoot(items[0]!.output);
    let manifestLoadMs = 0;

    const state: FinalizeGenerationBatchState = {
        specAnalysisAccumulator: null,
        gcMs: 0,
        manifestSaveMs: 0,
    };

    const result: SetupGenerationBatchResult = {
        start,
        cacheEnabled,
        cacheStrategy: cacheStrategy!,
        useReuseStore,
        generationCaches,
        reuseStore: null,
        referencedArtifactKeys,
        specStats,
        totalReuseHits: 0,
        totalReuseMisses: 0,
        reuseConflicts,
        reportBasePath,
        manifestLoadMs: 0,
        sharedFolderWriter: null,
        state,
    };

    const reuseMode = root.reuseMode ?? 'copy';
    if (reuseMode === 'auto-group' && cacheStrategy !== 'reuse') {
        writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.AUTO_GROUP_REQUIRES_REUSE_CACHE);
    }

    if (reuseMode === 'auto-group' && useReuseStore) {
        const absoluteOutputPaths = items.map(item => resolveOutputRoot(item.output));
        const lca = resolveOutputGroups(absoluteOutputPaths);
        if (lca) {
            result.sharedFolderWriter = new SharedFolderWriter(lca);
        } else {
            writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.AUTO_GROUP_LCA_TRIVIAL_FALLBACK);
        }
    }

    if (items.some(item => resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection)?.enabled)) {
        state.specAnalysisAccumulator = createSpecAnalysisAccumulator();
    }

    if (!cacheEnabled) {
        warnOnSharedOutputs(writeClient, items);
    } else if (useReuseStore) {
        warnOnSharedCoreServiceOutputs(writeClient, items, !!result.sharedFolderWriter);
        reuseStore = new ReuseStore(resolveReuseStorePath(items[0]!.cachePath));
        const loadStart = process.hrtime.bigint();
        await reuseStore.load();
        manifestLoadMs = Number(process.hrtime.bigint() - loadStart) / 1e6;
        reportBasePath = reuseStore.getRootPath();
        result.reuseStore = reuseStore;
        result.reportBasePath = reportBasePath;
        result.manifestLoadMs = manifestLoadMs;
        if (items.some(item => isClassesBundleLayout(item.modelsMode, item.modelsLayout))) {
            writeClient.logger.warn('ReuseStore is disabled for modelsMode=classes with layout=bundle; falling back to entity cache for those items');
        }
    }

    if (cacheEnabled && (cacheStrategy === 'entity' || cacheStrategy === 'reuse')) {
        for (const outputRoot of getUniqueResolvedOutputs(items)) {
            const sampleItem = items.find(item => resolveOutputRoot(item.output) === outputRoot);
            if (!sampleItem) {
                continue;
            }
            const cachePath =
                cacheStrategy === 'reuse' ? resolveHelper(resolveOutputRoot(sampleItem.output), DEFAULT_CACHE_FILENAME) : resolveCachePathForOutput(sampleItem.output, sampleItem.cachePath);
            const generationCache = new GenerationCache(cachePath);
            await generationCache.load();
            generationCaches.set(outputRoot, generationCache);
        }
    } else if (cacheEnabled && cacheStrategy === 'content' && items[0]?.cacheDebug) {
        writeClient.logger.info('cacheStrategy: content — relying on writeFileIfChanged only');
    }

    if (root.preAnalyze === true) {
        const willEntitySkipSpecItems = new Set<string>();
        for (const option of items) {
            const generationCache = cacheEnabled && (cacheStrategy === 'entity' || cacheStrategy === 'reuse') ? (generationCaches.get(resolveOutputRoot(option.output)) ?? null) : null;
            if (await shouldEntitySkip(option, generationCache, useReuseStore ? result.reuseStore : null)) {
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

    return result;
}

function getUniqueResolvedOutputs(items: TStrictFlatOptions[]): string[] {
    return Array.from(new Set(items.map(item => resolveOutputRoot(item.output))));
}

function resolveOutputRoot(output: string): string {
    return resolveHelper(process.cwd(), output);
}

function resolveReuseStorePath(cachePath: string): string {
    if (cachePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(cachePath)) {
        return cachePath;
    }
    return resolveHelper(process.cwd(), cachePath || '.openapi-codegen-store');
}

function resolveCachePathForOutput(output: string, cachePath: string): string {
    if (cachePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(cachePath)) {
        return cachePath;
    }
    return resolveHelper(resolveOutputRoot(output), cachePath || DEFAULT_CACHE_FILENAME);
}

function validateConsistentCacheSettings(writeClient: WriteClient, items: TStrictFlatOptions[]): void {
    if (items.length <= 1) {
        return;
    }

    const first = items[0]!;
    for (const item of items.slice(1)) {
        if (item.modelsMode !== first.modelsMode) {
            writeClient.logger.warn(
                `modelsMode differs between "${first.input}" (${first.modelsMode}) and "${item.input}" (${item.modelsMode}). ` +
                    `This may cause unexpected cache behavior when cacheStrategy is "reuse".`
            );
        }
    }
}

function warnOnSharedOutputs(writeClient: WriteClient, items: TStrictFlatOptions[]): void {
    const countByOutput = new Map<string, number>();
    for (const item of items) {
        const output = resolveOutputRoot(item.output);
        countByOutput.set(output, (countByOutput.get(output) ?? 0) + 1);
    }
    const duplicatedOutputs = Array.from(countByOutput.entries())
        .filter(([, count]) => count > 1)
        .map(([output]) => output);

    if (duplicatedOutputs.length === 0) {
        return;
    }

    writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.CACHE_SHARED_OUTPUT_WARNING(duplicatedOutputs.map(output => `- ${output}`).join('\n')));
}

function warnOnSharedCoreServiceOutputs(writeClient: WriteClient, items: TStrictFlatOptions[], sharedCoreActive = false): void {
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
    writeClient.logger.warn(
        sharedCoreActive ? LOGGER_MESSAGES.GENERATION.SHARED_CORE_SERVICES_PATH_COLLISION(details) : LOGGER_MESSAGES.GENERATION.SHARED_CORE_SERVICES_PATH_COLLISION_MODELS_ONLY(details)
    );
}
