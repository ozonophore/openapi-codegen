import SwaggerParser from '@apidevtools/swagger-parser';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { expandOpenApiRefsForSemanticDiff, type SemanticRefResolver } from './expandOpenApiRefsForSemanticDiff';

type SwaggerRefsLike = {
    exists: (ref: string) => boolean;
    get: (ref: string) => unknown;
};

function createSwaggerRefsResolver(refs: SwaggerRefsLike): SemanticRefResolver {
    return {
        exists: ref => refs.exists(ref),
        get: ref => refs.get(ref),
    };
}

function assertOpenApiObject(spec: unknown, source: string): asserts spec is Record<string, unknown> {
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
        throw new Error(`Invalid OpenAPI schema at ${source}`);
    }
}

/**
 * Загружает OpenAPI-файл для семантического diff без полного dereference.
 * @param input путь к файлу спецификации
 * @returns спецификация с развёрнутыми refs для семантического сравнения
 */
export async function loadSemanticOpenApiSpec(input: string): Promise<CommonOpenApi> {
    const absoluteInput = resolveHelper(process.cwd(), input);

    if (!input) {
        throw new Error(`OpenAPI spec path is empty`);
    }

    const exists = await fileSystemHelpers.exists(absoluteInput);
    if (!exists) {
        throw new Error(`OpenAPI spec not found: ${absoluteInput}`);
    }

    const parser = new SwaggerParser();
    const resolved = (await parser.resolve(absoluteInput)) as unknown as SwaggerRefsLike;
    const raw = resolved.get(absoluteInput);
    assertOpenApiObject(raw, absoluteInput);

    return expandOpenApiRefsForSemanticDiff(raw, {
        refs: createSwaggerRefsResolver(resolved),
        sourceFile: absoluteInput,
    }) as unknown as CommonOpenApi;
}

/**
 * Разворачивает уже загруженный OpenAPI-объект для семантического diff.
 * @param spec загруженная спецификация
 * @param [sourceFile] исходный путь к файлу для резолва внешних refs
 * @returns спецификация с развёрнутыми refs для семантического сравнения
 */
export async function loadSemanticOpenApiObject(spec: unknown, sourceFile?: string): Promise<CommonOpenApi> {
    assertOpenApiObject(spec, sourceFile ?? 'in-memory OpenAPI object');

    const parser = new SwaggerParser();
    const resolved = (await parser.resolve(spec as unknown as Parameters<SwaggerParser['resolve']>[0])) as unknown as SwaggerRefsLike;
    const absoluteSourceFile = sourceFile ? resolveHelper(process.cwd(), sourceFile) : undefined;

    return expandOpenApiRefsForSemanticDiff(spec, {
        refs: createSwaggerRefsResolver(resolved),
        sourceFile: absoluteSourceFile,
    }) as unknown as CommonOpenApi;
}
