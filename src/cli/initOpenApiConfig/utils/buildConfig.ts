import { COMMON_DEFAULT_OPTIONS_VALUES, DEFAULT_OUTPUT_API_DIR } from '../../../common/Consts';
import { TRawOptions } from '../../../common/TRawOptions';
import { ValidatedSpec } from './validateSpecFiles';

export type HttpConfigPaths = {
    request?: string;
    customExecutorPath?: string;
};

const spreadHttpConfig = (paths?: HttpConfigPaths, perItem = false): Record<string, string> => {
    if (!paths) {
        return {};
    }

    if (perItem && paths.request) {
        return { request: paths.request };
    }

    const result: Record<string, string> = {};
    if (!perItem && paths.request) {
        result.request = paths.request;
    }
    if (paths.customExecutorPath) {
        result.customExecutorPath = paths.customExecutorPath;
    }
    return result;
};

/**
 * Формирует конфигурацию на основе валидированных спецификаций
 */
export async function buildConfig(validatedSpecs: ValidatedSpec[], useMultiOption: boolean, httpConfig?: HttpConfigPaths, perSpecRequest?: boolean): Promise<TRawOptions> {
    if (useMultiOption) {
        const items = validatedSpecs.map(spec => ({
            input: spec.relativePath,
            output: DEFAULT_OUTPUT_API_DIR,
            ...(perSpecRequest ? spreadHttpConfig(httpConfig, true) : {}),
        }));

        return {
            items,
            httpClient: COMMON_DEFAULT_OPTIONS_VALUES.httpClient,
            sortByRequired: COMMON_DEFAULT_OPTIONS_VALUES.sortByRequired,
            enumPrefix: COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix,
            excludeCoreServiceFiles: COMMON_DEFAULT_OPTIONS_VALUES.excludeCoreServiceFiles,
            interfacePrefix: COMMON_DEFAULT_OPTIONS_VALUES.interfacePrefix,
            typePrefix: COMMON_DEFAULT_OPTIONS_VALUES.typePrefix,
            useCancelableRequest: COMMON_DEFAULT_OPTIONS_VALUES.useCancelableRequest,
            useOptions: COMMON_DEFAULT_OPTIONS_VALUES.useOptions,
            useSeparatedIndexes: COMMON_DEFAULT_OPTIONS_VALUES.useSeparatedIndexes,
            useUnionTypes: COMMON_DEFAULT_OPTIONS_VALUES.useUnionTypes,
            modelsMode: COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
            useHistory: COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
            diffReport: COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            ...(!perSpecRequest ? spreadHttpConfig(httpConfig) : {}),
            models: {
                mode: COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
                layout: COMMON_DEFAULT_OPTIONS_VALUES.modelsLayout,
            },
            analyze: {
                useHistory: COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
                reportPath: COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            },
            miracles: {
                enabled: true,
                confidence: 1,
                types: ['RENAME', 'TYPE_COERCION'],
            },
        };
    } else {
        if (validatedSpecs.length === 0) {
            throw new Error('No validated spec files found');
        }

        const firstSpec = validatedSpecs[0];

        return {
            input: firstSpec.relativePath,
            output: DEFAULT_OUTPUT_API_DIR,
            httpClient: COMMON_DEFAULT_OPTIONS_VALUES.httpClient,
            sortByRequired: COMMON_DEFAULT_OPTIONS_VALUES.sortByRequired,
            enumPrefix: COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix,
            excludeCoreServiceFiles: COMMON_DEFAULT_OPTIONS_VALUES.excludeCoreServiceFiles,
            interfacePrefix: COMMON_DEFAULT_OPTIONS_VALUES.interfacePrefix,
            typePrefix: COMMON_DEFAULT_OPTIONS_VALUES.typePrefix,
            useCancelableRequest: COMMON_DEFAULT_OPTIONS_VALUES.useCancelableRequest,
            useOptions: COMMON_DEFAULT_OPTIONS_VALUES.useOptions,
            useSeparatedIndexes: COMMON_DEFAULT_OPTIONS_VALUES.useSeparatedIndexes,
            useUnionTypes: COMMON_DEFAULT_OPTIONS_VALUES.useUnionTypes,
            modelsMode: COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
            useHistory: COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
            diffReport: COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            ...spreadHttpConfig(httpConfig),
            models: {
                mode: COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
                layout: COMMON_DEFAULT_OPTIONS_VALUES.modelsLayout,
            },
            analyze: {
                useHistory: COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
                reportPath: COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            },
            miracles: {
                enabled: true,
                confidence: 1,
                types: ['RENAME', 'TYPE_COERCION'],
            },
        };
    }
}

/**
 * Создает пример конфигурации, когда нет валидированных спецификаций
 */
export function buildExampleConfig(useMultiOption: boolean, httpConfig?: HttpConfigPaths, perSpecRequest?: boolean): TRawOptions {
    if (useMultiOption) {
        return {
            items: [
                {
                    input: './openapi/spec.yml',
                    output: DEFAULT_OUTPUT_API_DIR,
                    ...(perSpecRequest ? spreadHttpConfig(httpConfig, true) : {}),
                },
            ],
            httpClient: COMMON_DEFAULT_OPTIONS_VALUES.httpClient,
            sortByRequired: COMMON_DEFAULT_OPTIONS_VALUES.sortByRequired,
            enumPrefix: COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix,
            excludeCoreServiceFiles: COMMON_DEFAULT_OPTIONS_VALUES.excludeCoreServiceFiles,
            interfacePrefix: COMMON_DEFAULT_OPTIONS_VALUES.interfacePrefix,
            typePrefix: COMMON_DEFAULT_OPTIONS_VALUES.typePrefix,
            useCancelableRequest: COMMON_DEFAULT_OPTIONS_VALUES.useCancelableRequest,
            useOptions: COMMON_DEFAULT_OPTIONS_VALUES.useOptions,
            useSeparatedIndexes: COMMON_DEFAULT_OPTIONS_VALUES.useSeparatedIndexes,
            useUnionTypes: COMMON_DEFAULT_OPTIONS_VALUES.useUnionTypes,
            modelsMode: COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
            useHistory: COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
            diffReport: COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            ...(!perSpecRequest ? spreadHttpConfig(httpConfig) : {}),
            models: {
                mode: COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
                layout: COMMON_DEFAULT_OPTIONS_VALUES.modelsLayout,
            },
            analyze: {
                useHistory: COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
                reportPath: COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            },
            miracles: {
                enabled: true,
                confidence: 1,
                types: ['RENAME', 'TYPE_COERCION'],
            },
        };
    } else {
        return {
            input: './openapi/spec.yml',
            output: DEFAULT_OUTPUT_API_DIR,
            httpClient: COMMON_DEFAULT_OPTIONS_VALUES.httpClient,
            sortByRequired: COMMON_DEFAULT_OPTIONS_VALUES.sortByRequired,
            enumPrefix: COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix,
            excludeCoreServiceFiles: COMMON_DEFAULT_OPTIONS_VALUES.excludeCoreServiceFiles,
            interfacePrefix: COMMON_DEFAULT_OPTIONS_VALUES.interfacePrefix,
            typePrefix: COMMON_DEFAULT_OPTIONS_VALUES.typePrefix,
            useCancelableRequest: COMMON_DEFAULT_OPTIONS_VALUES.useCancelableRequest,
            useOptions: COMMON_DEFAULT_OPTIONS_VALUES.useOptions,
            useSeparatedIndexes: COMMON_DEFAULT_OPTIONS_VALUES.useSeparatedIndexes,
            useUnionTypes: COMMON_DEFAULT_OPTIONS_VALUES.useUnionTypes,
            modelsMode: COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
            useHistory: COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
            diffReport: COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            ...spreadHttpConfig(httpConfig),
            models: {
                mode: COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
                layout: COMMON_DEFAULT_OPTIONS_VALUES.modelsLayout,
            },
            analyze: {
                useHistory: COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
                reportPath: COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            },
            miracles: {
                enabled: true,
                confidence: 1,
                types: ['RENAME', 'TYPE_COERCION'],
            },
        };
    }
}
