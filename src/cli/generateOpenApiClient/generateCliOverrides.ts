import { TRawOptions } from '../../common/TRawOptions';
import { mergeMarauderBlockDeep } from '../../common/VersionedSchema/Utils/mergeMarauderBlock';
import { GenerateOptions } from '../schemas';

/** Ключи опций generate, которые CLI может перекрыть поверх конфига (скалярные поля). */
const GENERATE_CLI_OVERRIDE_KEYS = [
    'cache',
    'cachePath',
    'cacheStrategy',
    'cacheDebug',
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
] as const satisfies readonly (keyof GenerateOptions)[];

/** Keys excluded from `flatOptionsSchema` direct-mode validation (handled elsewhere). */
const DIRECT_FLAT_CLI_EXCLUDE_KEYS = new Set(['openapiConfig', 'exploitAnomalies', 'tsconfigPath', 'eslintConfigPath', 'autoSelect', 'anomalyDetection', 'anomalyExploitation', 'input', 'output']);

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
        anomalyDetection: validated.anomalyDetection,
        anomalyExploitation: validated.anomalyExploitation,
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
    merged.anomalyDetection = mergeMarauderBlockDeep(config.anomalyDetection, cli.anomalyDetection);
    merged.anomalyExploitation = mergeMarauderBlockDeep(config.anomalyExploitation, cli.anomalyExploitation);

    return merged;
}
