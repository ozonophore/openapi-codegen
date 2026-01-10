import { TRawOptions } from '../../../common/TRawOptions';
import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
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
export async function buildConfig(
    validatedSpecs: ValidatedSpec[],
    useMultiOption: boolean,
    customRequest?: string,
    perSpecRequest?: boolean
): Promise<TRawOptions> {
    if (useMultiOption) {
        const items = validatedSpecs.map(spec => ({
            input: spec.relativePath,
            ...(perSpecRequest && customRequest ? { request: customRequest } : {}),
        }));

        return {
            items,
            httpClient: HttpClient.FETCH,
            sortByRequired: true,
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
            output: './generated',
            httpClient: HttpClient.FETCH,
            sortByRequired: true,
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
export function buildExampleConfig(
    useMultiOption: boolean,
    customRequest?: string,
    perSpecRequest?: boolean
): TRawOptions {
    if (useMultiOption) {
        return {
            items: [
                {
                    input: './openapi/spec.yml',
                    ...(perSpecRequest && customRequest ? { request: customRequest } : {}),
                },
            ],
            httpClient: HttpClient.FETCH,
            sortByRequired: true,
            ...(!perSpecRequest && customRequest ? { request: customRequest } : {}),
        };
    } else {
        return {
            input: './openapi/spec.yml',
            output: './generated',
            httpClient: HttpClient.FETCH,
            sortByRequired: true,
            ...(customRequest ? { request: customRequest } : {}),
        };
    }
}