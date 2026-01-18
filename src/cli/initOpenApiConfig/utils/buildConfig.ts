import { COMMON_DEFAULT_OPTIONS_VALUES, DEFAULT_OUTPUT_API_DIR } from '../../../common/Consts';
import { TRawOptions } from '../../../common/TRawOptions';
import { ValidatedSpec } from './validateSpecFiles';

/**
 * Формирует конфигурацию на основе валидированных спецификаций
 * @param validatedSpecs - Массив валидированных спецификаций
 * @param useMultiOption - Использовать множественный формат (items)
 * @param customRequest - Путь к кастомной реализации request (опционально)
 * @param perSpecRequest - Использовать отдельный request для каждой спецификации (только для MULTI)
 * @returns Объект конфигурации
 * @throws {Error} Если нет валидированных спецификаций для плоского формата
 */
export async function buildConfig(validatedSpecs: ValidatedSpec[], useMultiOption: boolean, customRequest?: string, perSpecRequest?: boolean): Promise<TRawOptions> {
    if (useMultiOption) {
        const items = validatedSpecs.map(spec => ({
            input: spec.relativePath,
            output: DEFAULT_OUTPUT_API_DIR,
            ...(perSpecRequest && customRequest ? { request: customRequest } : {}),
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
            ...(!perSpecRequest && customRequest ? { request: customRequest } : {}),
        };
    } else {
        if (validatedSpecs.length === 0) {
            throw new Error('No validated spec files found');
        }

        // Для плоского варианта используем первую спецификацию
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
            ...(customRequest ? { request: customRequest } : {}),
        };
    }
}

/**
 * Создает пример конфигурации, когда нет валидированных спецификаций
 * @param useMultiOption - Использовать множественный формат (items)
 * @param customRequest - Путь к кастомной реализации request (опционально)
 * @param perSpecRequest - Использовать отдельный request для каждой спецификации (только для MULTI)
 * @returns Объект конфигурации-примера
 */
export function buildExampleConfig(useMultiOption: boolean, customRequest?: string, perSpecRequest?: boolean): TRawOptions {
    if (useMultiOption) {
        return {
            items: [
                {
                    input: './openapi/spec.yml',
                    output: DEFAULT_OUTPUT_API_DIR,
                    ...(perSpecRequest && customRequest ? { request: customRequest } : {}),
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
            ...(!perSpecRequest && customRequest ? { request: customRequest } : {}),
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
            ...(customRequest ? { request: customRequest } : {}),
        };
    }
}
