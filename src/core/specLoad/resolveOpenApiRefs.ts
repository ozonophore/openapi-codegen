import SwaggerParser from '@apidevtools/swagger-parser';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { SemanticRefResolver } from './expandOpenApiRefsForSemanticDiff';

/**
 * Minimal refs seam for semantic expand (subset of Swagger $Refs).
 */
export type SwaggerRefsLike = {
    exists: (ref: string) => boolean;
    get: (ref: string) => unknown;
};

export type ResolvedSwaggerRefs = Awaited<ReturnType<SwaggerParser['resolve']>>;

export function createSwaggerRefsResolver(refs: ResolvedSwaggerRefs | SwaggerRefsLike): SemanticRefResolver {
    const like = refs as unknown as SwaggerRefsLike;
    return {
        exists: ref => like.exists(ref),
        get: ref => like.get(ref),
    };
}

function assertOpenApiObject(spec: unknown, source: string): asserts spec is Record<string, unknown> {
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
        throw new Error(`Invalid OpenAPI schema at ${source}`);
    }
}

export type ResolvedOpenApiFromFile = {
    absoluteInput: string;
    refs: ResolvedSwaggerRefs;
    raw: Record<string, unknown>;
};

/**
 * Shared Spec-load prologue: empty/exists checks + `SwaggerParser.resolve` + root get.
 */
export async function resolveOpenApiRefsFromFile(input: string): Promise<ResolvedOpenApiFromFile> {
    const absoluteInput = resolveHelper(process.cwd(), input);

    if (!input) {
        throw new Error(`OpenAPI spec path is empty`);
    }

    const exists = await fileSystemHelpers.exists(absoluteInput);
    if (!exists) {
        throw new Error(`OpenAPI spec not found: ${absoluteInput}`);
    }

    const parser = new SwaggerParser();
    const refs = await parser.resolve(absoluteInput);
    const raw = refs.get(absoluteInput);
    assertOpenApiObject(raw, absoluteInput);

    return { absoluteInput, refs, raw };
}

export type ResolvedOpenApiFromObject = {
    absoluteSourceFile?: string;
    refs: ResolvedSwaggerRefs;
};

/**
 * Resolve refs for an already-loaded OpenAPI object (semantic in-memory path).
 */
export async function resolveOpenApiRefsFromObject(spec: unknown, sourceFile?: string): Promise<ResolvedOpenApiFromObject> {
    assertOpenApiObject(spec, sourceFile ?? 'in-memory OpenAPI object');

    const parser = new SwaggerParser();
    const refs = await parser.resolve(spec as unknown as Parameters<SwaggerParser['resolve']>[0]);
    const absoluteSourceFile = sourceFile ? resolveHelper(process.cwd(), sourceFile) : undefined;

    return { absoluteSourceFile, refs };
}
