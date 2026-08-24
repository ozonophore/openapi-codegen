import type { Context } from './Context';
import { type ForContextProps, loadOpenApiForContext } from './specLoad';
import type { VirtualFileMap } from './specLoad/VirtualFileMap';
import type { CommonOpenApi } from './types/shared/CommonOpenApi.model';

export type CreateResolvedContextProps = ForContextProps;

export type LoadedSpec = { context: Context; map: VirtualFileMap; openApi: CommonOpenApi };

/**
 * Builds a fully initialized Context for a spec file (refs + virtual file map) and returns the root document.
 * Thin facade over Spec-load `forContext`.
 */
export async function createResolvedContext(props: CreateResolvedContextProps): Promise<LoadedSpec> {
    return loadOpenApiForContext(props);
}
