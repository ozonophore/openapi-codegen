import { basename, extname } from 'path';

import type { TStrictFlatOptions } from '../../common/TRawOptions';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { buildOptionsSlice, buildOptionsSliceHash, hashFingerprint, stableStringify } from '../reuseStore/ArtifactFingerprinter';
import type { ReuseStore } from '../reuseStore/ReuseStore';
import { GenerationCache } from '../utils/GenerationCache';
import { isClassesBundleLayout } from '../utils/modelsLayoutHelpers';

/** Entity GenerationCache fingerprint envelope version (bump on shape change). */
export const ENTITY_CACHE_FINGERPRINT_VERSION = 3;

export function getSpecItemName(input: string): string {
    const absoluteInput = resolveHelper(process.cwd(), input);
    return basename(absoluteInput, extname(absoluteInput));
}

export function usesEntityCache(item: TStrictFlatOptions, generationCache: GenerationCache | null): boolean {
    return Boolean(item.cache && generationCache !== null && (item.cacheStrategy === 'entity' || item.cacheStrategy === 'reuse'));
}

export function usesReuseStoreForItem(item: TStrictFlatOptions, reuseStore: ReuseStore | null): boolean {
    return Boolean(item.cache && item.cacheStrategy === 'reuse' && reuseStore != null && !isClassesBundleLayout(item.modelsMode, item.modelsLayout));
}

export function buildCacheKey(item: TStrictFlatOptions, absoluteInput: string): string {
    return GenerationCache.hash(
        JSON.stringify({
            input: absoluteInput,
            output: item.output,
            outputCore: item.outputCore,
            outputServices: item.outputServices,
            outputModels: item.outputModels,
            outputSchemas: item.outputSchemas,
        })
    );
}

/**
 * Residual generation options that influence entity skip but are not part of OptionsSlice.
 * Plugins / disableBuiltinPlugins are covered by optionsSliceHash.
 */
export function buildEntityFingerprintResidual(item: TStrictFlatOptions): Record<string, unknown> {
    return {
        request: item.request,
        useOptions: item.useOptions,
        includeSchemasFiles: item.includeSchemasFiles,
        excludeCoreServiceFiles: item.excludeCoreServiceFiles,
        strictPluginMode: item.strictPluginMode,
        customExecutorPath: item.customExecutorPath,
        useCancelableRequest: item.useCancelableRequest,
        useHistory: item.useHistory,
        diffReport: item.diffReport,
        strictOpenapi: item.strictOpenapi,
        failOnGovernanceErrors: item.failOnGovernanceErrors,
    };
}

export async function buildEntityFingerprint(item: TStrictFlatOptions, absoluteInput: string): Promise<string> {
    const specContent = await fileSystemHelpers.readFile(absoluteInput, 'utf8');
    const optionsSlice = buildOptionsSlice(item);
    const envelope = {
        cacheFingerprintVersion: ENTITY_CACHE_FINGERPRINT_VERSION,
        generatorVersion: process.env.npm_package_version || 'dev',
        specHash: hashFingerprint(specContent),
        optionsSliceHash: buildOptionsSliceHash(optionsSlice),
        residual: buildEntityFingerprintResidual(item),
    };
    return hashFingerprint(stableStringify(envelope));
}

export async function defaultFilesExist(paths: string[]): Promise<boolean> {
    for (const filePath of paths) {
        const exists = await fileSystemHelpers.exists(filePath);
        if (!exists) {
            return false;
        }
    }
    return true;
}

export async function shouldEntitySkip(params: {
    item: TStrictFlatOptions;
    generationCache: GenerationCache | null;
    reuseStore: ReuseStore | null;
    filesExist?: (paths: string[]) => Promise<boolean>;
}): Promise<boolean> {
    const { item, generationCache, reuseStore } = params;
    const filesExist = params.filesExist ?? defaultFilesExist;
    const useEntityCache = usesEntityCache(item, generationCache);
    const absoluteInput = resolveHelper(process.cwd(), item.input);

    return resolveEntitySkipCandidate({
        useEntityCache,
        generationCache,
        cacheKey: buildCacheKey(item, absoluteInput),
        cacheFingerprint: useEntityCache ? await buildEntityFingerprint(item, absoluteInput) : '',
        useReuseStore: usesReuseStoreForItem(item, reuseStore),
        reuseStore,
        specInput: getSpecItemName(item.input),
        filesExist,
    });
}

/** Low-level skip check when key/fingerprint already computed (generateSingle write path). */
export async function resolveEntitySkipCandidate(params: {
    useEntityCache: boolean;
    generationCache: GenerationCache | null;
    cacheKey: string;
    cacheFingerprint: string;
    useReuseStore: boolean;
    reuseStore: ReuseStore | null;
    specInput: string;
    filesExist: (paths: string[]) => Promise<boolean>;
}): Promise<boolean> {
    const { useEntityCache, generationCache, cacheKey, cacheFingerprint, useReuseStore, reuseStore, specInput, filesExist } = params;

    if (!useEntityCache || !generationCache) {
        return false;
    }

    const cachedEntry = generationCache.get(cacheKey);
    if (!cachedEntry || cachedEntry.fingerprint !== cacheFingerprint) {
        return false;
    }

    if (!(await filesExist(cachedEntry.files))) {
        return false;
    }

    if (useReuseStore && reuseStore!.getManifest().specItems[specInput] == null) {
        return false;
    }

    return true;
}
