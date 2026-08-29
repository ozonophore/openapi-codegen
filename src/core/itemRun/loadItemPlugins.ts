import type { OpenApiGeneratorPlugin } from '../plugins/GeneratorPlugin.model';
import { loadGeneratorPlugins } from '../plugins/loadGeneratorPlugins';
import { mergePluginPaths, type PluginConfigEntry } from '../plugins/pluginEntries';

export async function loadItemPlugins(plugins: PluginConfigEntry[] | undefined, disableBuiltinPlugins: boolean | undefined): Promise<OpenApiGeneratorPlugin[]> {
    return loadGeneratorPlugins(mergePluginPaths(plugins, null), {
        disableBuiltins: disableBuiltinPlugins,
    });
}
