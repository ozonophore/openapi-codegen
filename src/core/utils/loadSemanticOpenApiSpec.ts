import { loadOpenApiForSemantic, loadOpenApiObjectForSemantic } from '../specLoad';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';

/**
 * Загружает OpenAPI-файл для семантического diff без полного dereference.
 * Thin facade over Spec-load `forSemantic`.
 * @param input путь к файлу спецификации
 * @returns спецификация с развёрнутыми refs для семантического сравнения
 */
export async function loadSemanticOpenApiSpec(input: string): Promise<CommonOpenApi> {
    return loadOpenApiForSemantic(input);
}

/**
 * Разворачивает уже загруженный OpenAPI-объект для семантического diff.
 * Thin facade over Spec-load `forSemantic`.
 * @param spec загруженная спецификация
 * @param [sourceFile] исходный путь к файлу для резолва внешних refs
 * @returns спецификация с развёрнутыми refs для семантического сравнения
 */
export async function loadSemanticOpenApiObject(spec: unknown, sourceFile?: string): Promise<CommonOpenApi> {
    return loadOpenApiObjectForSemantic(spec, sourceFile);
}
