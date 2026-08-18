import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { mergePluginPaths, type NormalizedPluginEntry, type PluginConfigEntry } from '../../core/plugins/pluginEntries';

/**
 * Collects plugin entries from root config and per-item overrides.
 *
 * Entries from all items are merged together (with dedupe by resolved path in the caller).
 * analyze-diff receives --input for a single spec but has no way to match it to a specific
 * config item at this layer, so the union of all item plugins is used as a safe superset.
 * If a future change resolves the active item by input path, this function should accept
 * an optional `activeInput` filter to narrow the set.
 */
function collectConfigPluginEntries(config: Record<string, unknown>): PluginConfigEntry[] {
    const collected: PluginConfigEntry[] = [];

    const append = (plugins: unknown): void => {
        if (Array.isArray(plugins)) {
            collected.push(...(plugins as PluginConfigEntry[]));
        }
    };

    append(config.plugins);

    const items = config.items;
    if (Array.isArray(items)) {
        for (const item of items) {
            if (item && typeof item === 'object') {
                append((item as Record<string, unknown>).plugins);
            }
        }
    }

    // Duplicates across root and items are deduped by resolved path inside mergePluginPaths.
    return collected;
}

/**
 * Reads plugin entries from openapi config and optional CLI paths for semantic diff hooks.
 * Preserves object `config` so `loadGeneratorPlugins` can call `configure`.
 */
export function resolvePluginEntries(openapiConfig?: string, cliPlugins?: string[]): NormalizedPluginEntry[] {
    const configData = loadConfigIfExists(openapiConfig);
    const config = convertArrayToObject(configData) as Record<string, unknown>;
    const configEntries = collectConfigPluginEntries(config);
    return mergePluginPaths(configEntries.length > 0 ? configEntries : undefined, cliPlugins);
}
