import { COMMON_DEFAULT_OPTIONS_VALUES } from '../common/Consts';
import { TFlatOptions, TRawOptions, TStrictFlatOptions } from '../common/TRawOptions';
import { resolveHelper } from '../common/utils/pathHelpers';
import { validateZodOptions } from '../common/Validation';
import { rawOptionsSchema } from '../common/VersionedSchema/AllVersionedSchemas/UnifiedVersionedSchemas';
import { dependentOptionsRefinement } from '../common/VersionedSchema/refinements/dependentOptionsRefinement';
import { normalizeMarauderBoolean } from '../common/VersionedSchema/Utils/createBooleanToObjectSchema';
import { mergeMarauderBlockDeep } from '../common/VersionedSchema/Utils/mergeMarauderBlock';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';

type DefaultRule = 'or' | 'nullish' | 'custom';

type RootAliases = {
    modelsMode: TRawOptions['modelsMode'];
    modelsLayout: TRawOptions['modelsLayout'];
    useHistory: TRawOptions['useHistory'];
    diffReport: TRawOptions['diffReport'];
};

/** Root-lived fields consumed by batch/finalize (not inherited into items). */
export type GenerationRootOptions = Pick<TRawOptions, 'reuseMode' | 'preAnalyze' | 'trafficSplitter' | 'swarm' | 'workspaceReport'>;

export type ResolveGenerationOptionsResult = {
    items: TStrictFlatOptions[];
    root: GenerationRootOptions;
};

type RootOnlyKey =
    | 'httpClient'
    | 'autoSelect'
    | 'customExecutorPath'
    | 'useOptions'
    | 'useUnionTypes'
    | 'includeSchemasFiles'
    | 'excludeCoreServiceFiles'
    | 'logLevel'
    | 'logTarget'
    | 'validationLibrary'
    | 'emptySchemaStrategy'
    | 'strictOpenapi'
    | 'reportFile'
    | 'failOnGovernanceErrors'
    | 'governanceConfig'
    | 'cache'
    | 'cachePath'
    | 'cacheStrategy'
    | 'cacheDebug'
    | 'reuseOnConflict'
    | 'prettierConfigPath';

type PerItemOverrideKey =
    | 'request'
    | 'plugins'
    | 'disableBuiltinPlugins'
    | 'strictPluginMode'
    | 'interfacePrefix'
    | 'enumPrefix'
    | 'typePrefix'
    | 'useCancelableRequest'
    | 'sortByRequired'
    | 'useSeparatedIndexes'
    | 'useHistory'
    | 'diffReport'
    | 'modelsMode'
    | 'modelsLayout'
    | 'miracles';

/** Root-only inherit keys (not in unifiedItemSchema). Optional `get` for special coercion. */
const ROOT_ONLY_KEYS: ReadonlyArray<{
    key: RootOnlyKey;
    get?: (root: TRawOptions) => TFlatOptions[RootOnlyKey];
}> = [
    { key: 'httpClient' },
    { key: 'autoSelect', get: root => normalizeMarauderBoolean(root.autoSelect) },
    { key: 'customExecutorPath' },
    { key: 'useOptions' },
    { key: 'useUnionTypes' },
    { key: 'includeSchemasFiles' },
    { key: 'excludeCoreServiceFiles' },
    { key: 'logLevel' },
    { key: 'logTarget' },
    { key: 'validationLibrary' },
    { key: 'emptySchemaStrategy' },
    { key: 'strictOpenapi' },
    { key: 'reportFile' },
    { key: 'failOnGovernanceErrors' },
    { key: 'governanceConfig' },
    { key: 'cache' },
    { key: 'cachePath' },
    { key: 'cacheStrategy' },
    { key: 'cacheDebug' },
    { key: 'reuseOnConflict' },
    { key: 'prettierConfigPath' },
];

/** Per-item overridable keys; the four alias fields resolve via `RootAliases`. */
const PER_ITEM_OVERRIDE_KEYS: readonly PerItemOverrideKey[] = [
    'request',
    'plugins',
    'disableBuiltinPlugins',
    'strictPluginMode',
    'interfacePrefix',
    'enumPrefix',
    'typePrefix',
    'useCancelableRequest',
    'sortByRequired',
    'useSeparatedIndexes',
    'useHistory',
    'diffReport',
    'modelsMode',
    'modelsLayout',
    'miracles',
];

const ALIAS_KEYS = new Set<PerItemOverrideKey>(['modelsMode', 'modelsLayout', 'useHistory', 'diffReport']);

/** Flat-local fields copied from raw (identity / nested models bag). */
const FLAT_LOCAL_KEYS = ['input', 'output', 'outputCore', 'outputServices', 'outputModels', 'outputSchemas', 'models'] as const;

/**
 * Defaults table: every key formerly listed in addDefaultValues.
 * Insertion order matches prior hand-written object (bit-identical JSON key order).
 */
const DEFAULT_RULES = {
    input: 'or',
    output: 'or',
    outputCore: 'or',
    outputServices: 'or',
    outputModels: 'or',
    outputSchemas: 'or',
    httpClient: 'or',
    useOptions: 'nullish',
    useUnionTypes: 'nullish',
    includeSchemasFiles: 'nullish',
    excludeCoreServiceFiles: 'nullish',
    request: 'or',
    plugins: 'or',
    disableBuiltinPlugins: 'nullish',
    strictPluginMode: 'nullish',
    customExecutorPath: 'or',
    interfacePrefix: 'or',
    enumPrefix: 'or',
    typePrefix: 'or',
    useCancelableRequest: 'nullish',
    logLevel: 'or',
    logTarget: 'or',
    sortByRequired: 'nullish',
    useSeparatedIndexes: 'nullish',
    validationLibrary: 'nullish',
    emptySchemaStrategy: 'nullish',
    useHistory: 'nullish',
    diffReport: 'or',
    modelsMode: 'nullish',
    modelsLayout: 'custom',
    models: 'or',
    analyze: 'or',
    miracles: 'or',
    strictOpenapi: 'nullish',
    reportFile: 'or',
    failOnGovernanceErrors: 'nullish',
    prettierConfigPath: 'nullish',
    governanceConfig: 'or',
    cache: 'nullish',
    cachePath: 'or',
    cacheStrategy: 'nullish',
    cacheDebug: 'nullish',
    reuseOnConflict: 'nullish',
    autoSelect: 'nullish',
    specAnalysis: 'custom',
    anomalyDetection: 'nullish',
    workspaceReport: 'nullish',
    trafficSplitter: 'nullish',
    swarm: 'nullish',
    preAnalyze: 'nullish',
    reuseMode: 'nullish',
} as const satisfies Record<keyof TStrictFlatOptions, DefaultRule>;

const CUSTOM_DEFAULTS: {
    [K in keyof TStrictFlatOptions]?: (item: TFlatOptions) => TStrictFlatOptions[K];
} = {
    modelsLayout: item => item.modelsLayout ?? item.models?.layout ?? COMMON_DEFAULT_OPTIONS_VALUES.modelsLayout,
    specAnalysis: item => resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection) ?? COMMON_DEFAULT_OPTIONS_VALUES.specAnalysis,
};

function resolveRootAliases(raw: TRawOptions): RootAliases {
    return {
        modelsMode: raw.modelsMode ?? raw.models?.mode,
        modelsLayout: raw.modelsLayout ?? raw.models?.layout,
        useHistory: raw.useHistory ?? raw.analyze?.useHistory,
        diffReport: raw.diffReport ?? raw.analyze?.reportPath,
    };
}

function mergeItemMarauderBlock<T extends Record<string, unknown>>(root: T | boolean | undefined, item: T | boolean | undefined): T | undefined {
    if (item === undefined) {
        return normalizeMarauderBoolean(root);
    }
    if (root === undefined) {
        return normalizeMarauderBoolean(item);
    }

    return mergeMarauderBlockDeep(normalizeMarauderBoolean(root), normalizeMarauderBoolean(item)) as T;
}

function pickRootOnlyFields(root: TRawOptions): Pick<TFlatOptions, RootOnlyKey> {
    const out: Record<string, unknown> = {};
    for (const { key, get } of ROOT_ONLY_KEYS) {
        out[key] = get ? get(root) : root[key];
    }
    return out as Pick<TFlatOptions, RootOnlyKey>;
}

function pickPerItemOverrides(item: Partial<TFlatOptions>, root: TRawOptions, aliases: RootAliases): Pick<TFlatOptions, PerItemOverrideKey> {
    const out: Record<string, unknown> = {};
    for (const key of PER_ITEM_OVERRIDE_KEYS) {
        const rootVal = ALIAS_KEYS.has(key) ? aliases[key as keyof RootAliases] : root[key as keyof TRawOptions];
        out[key] = item[key] ?? rootVal;
    }
    return out as Pick<TFlatOptions, PerItemOverrideKey>;
}

function pickFlatLocalFields(raw: TRawOptions): Pick<TFlatOptions, (typeof FLAT_LOCAL_KEYS)[number]> {
    const out: Record<string, unknown> = {};
    for (const key of FLAT_LOCAL_KEYS) {
        if (key === 'input') {
            out.input = raw.input ?? '';
        } else if (key === 'output') {
            out.output = raw.output ?? '';
        } else {
            out[key] = raw[key];
        }
    }
    return out as Pick<TFlatOptions, (typeof FLAT_LOCAL_KEYS)[number]>;
}

function normalizeOptions(rawOptions: TRawOptions): TFlatOptions[] {
    const aliases = resolveRootAliases(rawOptions);
    if (rawOptions.items && rawOptions.items.length > 0) {
        const rootOnly = pickRootOnlyFields(rawOptions);
        return rawOptions.items.map(item => {
            const flatItem = item as TFlatOptions;
            return {
                ...flatItem,
                ...rootOnly,
                // explicit marauder merges (not generic pick)
                specAnalysis: mergeItemMarauderBlock(rawOptions.specAnalysis, flatItem.specAnalysis),
                anomalyDetection: mergeItemMarauderBlock(rawOptions.anomalyDetection, flatItem.anomalyDetection),
                ...pickPerItemOverrides(flatItem, rawOptions, aliases),
            };
        });
    }

    // Flat format (CLI / legacy config): one item from raw + aliases + marauder normalize
    const rootOnly = pickRootOnlyFields(rawOptions);
    return [
        {
            ...pickFlatLocalFields(rawOptions),
            ...rootOnly,
            specAnalysis: normalizeMarauderBoolean(rawOptions.specAnalysis),
            anomalyDetection: normalizeMarauderBoolean(rawOptions.anomalyDetection),
            ...pickPerItemOverrides(rawOptions as TFlatOptions, rawOptions, aliases),
        },
    ];
}

function addDefaultValues(item: TFlatOptions): TStrictFlatOptions {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULT_RULES) as (keyof typeof DEFAULT_RULES)[]) {
        const rule = DEFAULT_RULES[key];
        if (rule === 'custom') {
            result[key] = CUSTOM_DEFAULTS[key]!(item);
            continue;
        }
        const value = item[key as keyof TFlatOptions];
        const fallback = COMMON_DEFAULT_OPTIONS_VALUES[key];
        result[key] = rule === 'or' ? value || fallback : (value ?? fallback);
    }
    return result as TStrictFlatOptions;
}

/**
 * Owns options meaning: Zod validate (throws) → flatten/inherit → defaults → `{ items, root }`.
 */
export function resolveGenerationOptions(rawOptions: TRawOptions): ResolveGenerationOptionsResult {
    const currentSchema = rawOptionsSchema.superRefine(dependentOptionsRefinement);
    const validationResult = validateZodOptions(currentSchema, rawOptions);

    if (!validationResult.success) {
        throw new Error(validationResult.errors.join('\n'));
    }

    return {
        items: normalizeOptions(rawOptions).map(item => addDefaultValues(item)),
        root: projectGenerationRootOptions(rawOptions),
    };
}

function projectGenerationRootOptions(raw: TRawOptions): GenerationRootOptions {
    return {
        reuseMode: raw.reuseMode,
        preAnalyze: raw.preAnalyze,
        trafficSplitter: raw.trafficSplitter,
        swarm: raw.swarm,
        workspaceReport: raw.workspaceReport,
    };
}

/**
 * Path fields in TStrictFlatOptions that are always resolved relative to CWD.
 * Note: `cachePath` is intentionally excluded — for `cacheStrategy: 'entity'` it is
 * resolved relative to the output directory, not CWD (handled inside setupGenerationBatch).
 */
const PATH_FIELDS_IN_ITEM = [
    'input',
    'output',
    'outputCore',
    'outputModels',
    'outputServices',
    'outputSchemas',
    'request',
    'customExecutorPath',
    'prettierConfigPath',
    'governanceConfig',
    'reportFile',
] as const satisfies ReadonlyArray<keyof TStrictFlatOptions>;

function normalizePlugins(plugins: TStrictFlatOptions['plugins'], cwd: string): TStrictFlatOptions['plugins'] {
    if (!plugins || !Array.isArray(plugins)) {
        return plugins;
    }
    return plugins.map(entry => {
        if (typeof entry === 'string') {
            return entry ? resolveHelper(cwd, entry) : entry;
        }
        if (entry && typeof entry === 'object' && typeof (entry as { path?: unknown }).path === 'string') {
            const path = (entry as { path: string }).path;
            return path ? { ...entry, path: resolveHelper(cwd, path) } : entry;
        }
        return entry;
    }) as TStrictFlatOptions['plugins'];
}

/**
 * Resolves all path fields in TStrictFlatOptions items to absolute POSIX paths.
 *
 * MUST be called after resolveGenerationOptions, before passing items to any core function.
 * After normalization the following fields are guaranteed to be absolute (or empty string if
 * they were empty before): input, output, outputCore, outputModels, outputServices,
 * outputSchemas, request, customExecutorPath, prettierConfigPath, governanceConfig,
 * reportFile, and plugins[].path.
 */
export function normalizePathsToAbsolute(result: ResolveGenerationOptionsResult, cwd: string): ResolveGenerationOptionsResult {
    return {
        ...result,
        items: result.items.map(item => {
            const normalized = { ...item };
            for (const field of PATH_FIELDS_IN_ITEM) {
                const value = normalized[field];
                if (value && typeof value === 'string') {
                    (normalized as Record<string, unknown>)[field] = resolveHelper(cwd, value);
                }
            }
            normalized.plugins = normalizePlugins(item.plugins, cwd);
            return normalized;
        }),
    };
}
