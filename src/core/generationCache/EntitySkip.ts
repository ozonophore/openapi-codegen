import { basename, extname } from 'path';

import type { TStrictFlatOptions } from '../../common/TRawOptions';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { buildOptionsSlice, buildOptionsSliceHash, hashFingerprint, stableStringify } from '../reuseStore/ArtifactFingerprinter';
import type { ReuseStore } from '../reuseStore/ReuseStore';
import type { OptionsSlice } from '../reuseStore/types';
import { GenerationCache } from '../utils/GenerationCache';
import { isClassesBundleLayout } from '../utils/modelsLayoutHelpers';

/** Entity GenerationCache fingerprint envelope version (bump on shape change). */
export const ENTITY_CACHE_FINGERPRINT_VERSION = 3;

/**
 * OptionsSlice Pick keys — covered by optionsSliceHash (not residual).
 * Keep in sync with `OptionsSlice` in reuseStore/types.ts.
 */
const OPTIONS_SLICE_PICK_KEYS = [
    'validationLibrary',
    'useUnionTypes',
    'interfacePrefix',
    'enumPrefix',
    'typePrefix',
    'modelsMode',
    'modelsLayout',
    'sortByRequired',
    'emptySchemaStrategy',
    'useSeparatedIndexes',
    'httpClient',
    'prettierConfigPath',
    'disableBuiltinPlugins',
] as const satisfies readonly (keyof OptionsSlice)[];

/** Covered by optionsSliceHash / pluginsHash — excluded from residual. */
export const ENTITY_FINGERPRINT_SLICE_COVERAGE_KEYS = ['plugins', ...OPTIONS_SLICE_PICK_KEYS] as const;

/**
 * Generation-affecting keys for entity fingerprint: OptionsSlice coverage ∪ residual fields.
 * Residual = affecting − coverage (must stay bit-identical to the former hand residual list).
 */
export const ENTITY_FINGERPRINT_AFFECTING_KEYS = [
    ...ENTITY_FINGERPRINT_SLICE_COVERAGE_KEYS,
    'request',
    'useOptions',
    'includeSchemasFiles',
    'excludeCoreServiceFiles',
    'strictPluginMode',
    'customExecutorPath',
    'useCancelableRequest',
    'useHistory',
    'diffReport',
    'strictOpenapi',
    'failOnGovernanceErrors',
] as const satisfies readonly (keyof TStrictFlatOptions)[];

const SLICE_COVERAGE_SET = new Set<string>(ENTITY_FINGERPRINT_SLICE_COVERAGE_KEYS);

/** Residual keys in stable insertion order (former hand list order). */
export const ENTITY_FINGERPRINT_RESIDUAL_KEYS = ENTITY_FINGERPRINT_AFFECTING_KEYS.filter(key => !SLICE_COVERAGE_SET.has(key));

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
 * Residual generation options that influence entity skip but are not part of OptionsSlice coverage.
 * Derived: ENTITY_FINGERPRINT_AFFECTING_KEYS − slice/plugin coverage.
 */
export function buildEntityFingerprintResidual(item: TStrictFlatOptions): Record<string, unknown> {
    const residual: Record<string, unknown> = {};
    for (const key of ENTITY_FINGERPRINT_RESIDUAL_KEYS) {
        residual[key] = item[key];
    }
    return residual;
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

/** Low-level skip check when key/fingerprint already computed (Generation item session write path). */
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

    if (useReuseStore) {
        if (reuseStore!.getManifest().specItems[specInput] == null) {
            return false;
        }
        if (!(await reuseStore!.verifySpecItemIntegrity(specInput))) {
            return false;
        }
    }

    return true;
}
