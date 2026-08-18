import { EMigrationMode } from '../../common/Enums';
import { TRawOptions } from '../../common/TRawOptions';
import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { validateZodOptions } from '../../common/Validation';
import { flatOptionsSchema } from '../../common/VersionedSchema/AllVersionedSchemas/UnifiedVersionedSchemas';
import { mergeMarauderBlockDeep } from '../../common/VersionedSchema/Utils/mergeMarauderBlock';
import { migrateLoadedConfigToLatest } from '../../common/VersionedSchema/Utils/migrateLoadedConfigToLatest';
import { resolveSpecAnalysisConfig } from '../../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import { mergePluginPaths, type PluginConfigEntry } from '../../core/plugins/pluginEntries';
import { GenerateOptions } from '../schemas';

/** Ключи опций generate, которые CLI может перекрыть поверх конфига (скалярные поля). */
export const GENERATE_CLI_OVERRIDE_KEYS = [
    'cache',
    'cachePath',
    'cacheStrategy',
    'cacheDebug',
    'reuseOnConflict',
    'strictOpenapi',
    'reportFile',
    'failOnGovernanceErrors',
    'governanceConfig',
    'prettierConfigPath',
    'tsconfigPath',
    'eslintConfigPath',
    'useHistory',
    'diffReport',
    'modelsMode',
    'modelsLayout',
    'preAnalyze',
    'reuseMode',
    'strictPluginMode',
] as const satisfies readonly (keyof GenerateOptions)[];

/** Keys excluded from `flatOptionsSchema` direct-mode validation (handled elsewhere). */
const DIRECT_FLAT_CLI_EXCLUDE_KEYS = new Set([
    'openapiConfig',
    'tsconfigPath',
    'eslintConfigPath',
    'autoSelect',
    'specAnalysis',
    'anomalyDetection',
    'workspaceReport',
    'trafficSplitter',
    'swarm',
    'input',
    'output',
]);

const generateCliFlatSchema = flatOptionsSchema.strict().superRefine((data, ctx) => {
    if (data.excludeCoreServiceFiles === true && data.request) {
        ctx.addIssue({
            code: 'custom',
            message: '"request" can only be used when "excludeCoreServiceFiles" is false',
            path: ['request'],
        });
    }
});

/**
 * Собирает вход для direct-mode валидации `flatOptionsSchema`.
 * Marauder-поля берутся из Zod-transformed CLI options; root-only ключи исключаются.
 */
export function pickDirectFlatCliInput(clientOptions: Record<string, unknown>, validated: GenerateOptions): Record<string, unknown> {
    const flatCli: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(clientOptions)) {
        if (!DIRECT_FLAT_CLI_EXCLUDE_KEYS.has(key)) {
            flatCli[key] = value;
        }
    }

    return {
        ...flatCli,
        input: validated.input,
        output: validated.output,
        autoSelect: validated.autoSelect,
        specAnalysis: validated.specAnalysis,
        anomalyDetection: validated.anomalyDetection,
    };
}

/**
 * Сливает CLI-флаги generate с опциями из конфига или direct mode.
 * Скалярные поля перекрываются; Marauder-блоки merge'ятся через mergeMarauderBlockDeep
 * (shallow spread + one-level handling для excludeCategories / detectionRules).
 */
export function mergeGenerateCliOverrides(config: TRawOptions, cli: GenerateOptions): TRawOptions {
    const merged: TRawOptions = { ...config };

    for (const key of GENERATE_CLI_OVERRIDE_KEYS) {
        const cliValue = cli[key];
        if (cliValue !== undefined) {
            (merged as Record<string, unknown>)[key] = cliValue;
        }
    }

    merged.autoSelect = mergeMarauderBlockDeep(config.autoSelect, cli.autoSelect);
    merged.specAnalysis = resolveSpecAnalysisConfig(mergeMarauderBlockDeep(config.specAnalysis, cli.specAnalysis), mergeMarauderBlockDeep(config.anomalyDetection, cli.anomalyDetection));
    merged.anomalyDetection = mergeMarauderBlockDeep(config.anomalyDetection, cli.anomalyDetection);

    (merged as Record<string, unknown>).workspaceReport = mergeMarauderBlockDeep(
        (config as Record<string, unknown>).workspaceReport as Parameters<typeof mergeMarauderBlockDeep>[0],
        cli.workspaceReport
    );
    (merged as Record<string, unknown>).trafficSplitter = mergeMarauderBlockDeep(
        (config as Record<string, unknown>).trafficSplitter as Parameters<typeof mergeMarauderBlockDeep>[0],
        cli.trafficSplitter
    );
    (merged as Record<string, unknown>).swarm = mergeMarauderBlockDeep((config as Record<string, unknown>).swarm as Parameters<typeof mergeMarauderBlockDeep>[0], cli.swarm);

    if (cli.plugins !== undefined) {
        const cliPluginPaths = cli.plugins as string[];
        merged.plugins = mergePluginPaths(config.plugins as PluginConfigEntry[] | undefined, cliPluginPaths);

        if (merged.items?.length) {
            merged.items = merged.items.map(item => {
                const itemPlugins = (item as { plugins?: PluginConfigEntry[] }).plugins;
                if (itemPlugins === undefined) {
                    return item;
                }
                return {
                    ...item,
                    plugins: mergePluginPaths(itemPlugins, cliPluginPaths),
                };
            });
        }
    }

    return merged;
}

export type ResolveGenerateCliToRawInput = {
    clientOptions: Record<string, unknown>;
    validated: GenerateOptions;
};

export type ResolveGenerateCliToRawResult =
    | { ok: true; raw: TRawOptions; deprecatedArrayConfig?: boolean }
    | { ok: false; kind: 'direct_validation'; errors: string[] }
    | { ok: false; kind: 'config_missing'; hasExplicitPath: boolean }
    | { ok: false; kind: 'migration_failed' };

/**
 * CLI → TRawOptions for generate: direct (flat validate + merge) or config (load + migrate + merge).
 * Flat Zod refine runs only here for the direct path.
 */
export function resolveGenerateCliToRawOptions(input: ResolveGenerateCliToRawInput): ResolveGenerateCliToRawResult {
    const { clientOptions, validated } = input;
    const hasMinimumRequiredOptions = !!validated.input && !!validated.output;

    if (hasMinimumRequiredOptions) {
        const directOptionsValidationResult = validateZodOptions(generateCliFlatSchema, pickDirectFlatCliInput(clientOptions, validated));

        if (!directOptionsValidationResult.success) {
            return { ok: false, kind: 'direct_validation', errors: directOptionsValidationResult.errors };
        }

        return {
            ok: true,
            raw: mergeGenerateCliOverrides(directOptionsValidationResult.data as TRawOptions, validated),
        };
    }

    const configData = loadConfigIfExists(validated.openapiConfig);
    if (!configData) {
        return { ok: false, kind: 'config_missing', hasExplicitPath: !!validated.openapiConfig };
    }

    const deprecatedArrayConfig = Array.isArray(configData);
    const preparedOptions = convertArrayToObject(configData);

    const migratedOptions = migrateLoadedConfigToLatest(preparedOptions, EMigrationMode.GENERATE_OPENAPI);

    if (!migratedOptions) {
        return { ok: false, kind: 'migration_failed' };
    }

    return {
        ok: true,
        raw: mergeGenerateCliOverrides(migratedOptions.value as TRawOptions, validated),
        deprecatedArrayConfig,
    };
}
