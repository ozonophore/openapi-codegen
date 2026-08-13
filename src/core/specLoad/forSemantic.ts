import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { expandOpenApiRefsForSemanticDiff } from './expandOpenApiRefsForSemanticDiff';
import { createSwaggerRefsResolver, resolveOpenApiRefsFromFile, resolveOpenApiRefsFromObject } from './resolveOpenApiRefs';

/**
 * Spec-load mode for semantic diff: file path → expand clone.
 */
export async function loadOpenApiForSemantic(input: string): Promise<CommonOpenApi> {
    const { absoluteInput, refs, raw } = await resolveOpenApiRefsFromFile(input);

    return expandOpenApiRefsForSemanticDiff(raw, {
        refs: createSwaggerRefsResolver(refs),
        sourceFile: absoluteInput,
    }) as unknown as CommonOpenApi;
}

/**
 * Spec-load mode for semantic diff: in-memory object → expand clone.
 */
export async function loadOpenApiObjectForSemantic(spec: unknown, sourceFile?: string): Promise<CommonOpenApi> {
    const { absoluteSourceFile, refs } = await resolveOpenApiRefsFromObject(spec, sourceFile);

    return expandOpenApiRefsForSemanticDiff(spec, {
        refs: createSwaggerRefsResolver(refs),
        sourceFile: absoluteSourceFile,
    }) as unknown as CommonOpenApi;
}
