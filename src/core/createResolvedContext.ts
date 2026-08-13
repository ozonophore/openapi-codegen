import SwaggerParser from '@apidevtools/swagger-parser';

import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { resolveHelper } from '../common/utils/pathHelpers';
import { Context } from './Context';
import type { OpenApiGeneratorPlugin } from './plugins/GeneratorPlugin.model';
import type { OutputPaths } from './types/base/OutputPaths.model';
import type { PrefixArtifacts } from './types/base/PrefixArtifacts.model';
import type { CommonOpenApi } from './types/shared/CommonOpenApi.model';

export type CreateResolvedContextProps = {
    input: string;
    output: OutputPaths;
    prefix?: PrefixArtifacts;
    sortByRequired?: boolean;
    plugins?: OpenApiGeneratorPlugin[];
    strictPluginMode?: boolean;
};

/**
 * Builds a fully initialized Context for a spec file (refs + virtual file map) and returns the root document.
 */
export async function createResolvedContext(props: CreateResolvedContextProps): Promise<{ context: Context; openApi: CommonOpenApi }> {
    const absoluteInput = resolveHelper(process.cwd(), props.input);

    if (!props.input) {
        throw new Error(`OpenAPI spec path is empty`);
    }

    const exists = await fileSystemHelpers.exists(absoluteInput);
    if (!exists) {
        throw new Error(`OpenAPI spec not found: ${absoluteInput}`);
    }

    const context = new Context({
        ...props,
        input: absoluteInput,
    });

    const parser = new SwaggerParser();
    const resolved = await parser.resolve(absoluteInput);
    const raw = resolved.get(absoluteInput);
    if (!raw || typeof raw !== 'object') {
        throw new Error(`Invalid OpenAPI schema at ${absoluteInput}`);
    }

    context.attachResolvedOpenApi(resolved, absoluteInput);

    return { context, openApi: raw as unknown as CommonOpenApi };
}
