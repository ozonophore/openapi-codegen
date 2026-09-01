import { buildFactoryPluginSync } from '../buildFactoryPlugin';
import { PluginApi } from '../GeneratorPlugin.model';

/**
 * Reads `x-typescript-type` OpenAPI extension and maps it to a generated TS type.
 */
function createXTypescriptTypePlugin(api: PluginApi): void {
    api.onSchemaTypeOverride(({ schema }) => {
        const customType = schema['x-typescript-type'];
        return typeof customType === 'string' && customType.trim() ? customType.trim() : undefined;
    });
}

export const xTypescriptTypePlugin = buildFactoryPluginSync(createXTypescriptTypePlugin, {
    name: 'x-typescript-type',
    apiVersion: '3',
});
