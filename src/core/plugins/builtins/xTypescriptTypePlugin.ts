import { buildNormalizedPlugin } from '../buildNormalizedPlugin';
import { OpenApiGeneratorPlugin, OpenApiPluginFactory, OpenApiPluginFactoryModule, OpenApiPluginMeta, PluginApi } from '../GeneratorPlugin.model';

/** Metadata for the built-in `x-typescript-type` plugin. */
const meta: OpenApiPluginMeta = {
    name: 'x-typescript-type',
    apiVersion: '3',
};

/**
 * v3 factory for the built-in `x-typescript-type` plugin.
 * Maps OpenAPI `x-typescript-type` schema extension to a generated TypeScript type.
 */
export const createXTypescriptTypePlugin: OpenApiPluginFactory = (api: PluginApi) => {
    api.onSchemaTypeOverride(({ schema }) => {
        const customType = schema['x-typescript-type'];
        return typeof customType === 'string' && customType.trim() ? customType.trim() : undefined;
    });
};

/** Module export shape for the built-in `x-typescript-type` plugin. */
export const xTypescriptTypePluginModule: OpenApiPluginFactoryModule = {
    meta,
    createPlugin: createXTypescriptTypePlugin,
};

/**
 * Pre-built normalized plugin used by the generator runtime and unit tests.
 * Runs after user plugins and acts as a fallback type override handler.
 */
export const xTypescriptTypePlugin: OpenApiGeneratorPlugin = buildNormalizedPlugin(meta, {
    schemaTypeOverrideHandlers: [
        ({ schema }) => {
            const customType = schema['x-typescript-type'];
            return typeof customType === 'string' && customType.trim() ? customType.trim() : undefined;
        },
    ],
});
