import { Context } from '../Context';
import type { OpenApiGeneratorPlugin } from '../plugins/GeneratorPlugin.model';
import type { OutputPaths } from '../types/base/OutputPaths.model';
import type { PrefixArtifacts } from '../types/base/PrefixArtifacts.model';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { resolveOpenApiRefsFromFile } from './resolveOpenApiRefs';

export type ForContextProps = {
    input: string;
    output: OutputPaths;
    prefix?: PrefixArtifacts;
    sortByRequired?: boolean;
    plugins?: OpenApiGeneratorPlugin[];
    strictPluginMode?: boolean;
};

/**
 * Spec-load mode for generation / preAnalyze: Context + attached refs + root document.
 */
export async function loadOpenApiForContext(props: ForContextProps): Promise<{ context: Context; openApi: CommonOpenApi }> {
    const { absoluteInput, refs, raw } = await resolveOpenApiRefsFromFile(props.input);

    const context = new Context({
        ...props,
        input: absoluteInput,
    });

    context.attachResolvedOpenApi(refs, absoluteInput);

    return { context, openApi: raw as unknown as CommonOpenApi };
}
