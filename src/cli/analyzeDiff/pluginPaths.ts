import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { mergePluginPaths, type NormalizedPluginEntry, type PluginConfigEntry } from '../../core/plugins/pluginEntries';

/**
 * Collects plugin entries from root config plus the Active item (absolute `--input` match).
 * Omitting `activeInput` or missing a match yields root plugins only — not the union of every item.
 */
function collectConfigPluginEntries(config: Record<string, unknown>, activeInput?: string): PluginConfigEntry[] {
    const collected: PluginConfigEntry[] = [];

    const append = (plugins: unknown): void => {
        if (Array.isArray(plugins)) {
            collected.push(...(plugins as PluginConfigEntry[]));
        }
    };

    append(config.plugins);

    const items = config.items;
    if (!activeInput || !Array.isArray(items)) {
        return collected;
    }

    const absoluteActive = resolveHelper(activeInput);
    const matches: Record<string, unknown>[] = [];
    for (const item of items) {
        if (!item || typeof item !== 'object') {
            continue;
        }
        const record = item as Record<string, unknown>;
        if (typeof record.input !== 'string') {
            continue;
        }
        if (resolveHelper(record.input) === absoluteActive) {
            matches.push(record);
        }
    }

    if (matches.length > 1) {
        APP_LOGGER.warn(LOGGER_MESSAGES.ANALYZE_DIFF.DUPLICATE_ACTIVE_ITEM(absoluteActive, matches.length));
    }

    for (const match of matches) {
        append(match.plugins);
    }

    return collected;
}

/**
 * Reads plugin entries from openapi config and optional CLI paths for semantic diff hooks.
 * Preserves object `config` so `loadGeneratorPlugins` can call `configure`.
 * `activeInput` is the analyze-diff `--input` (absolute); Git / `--compare-with` are not used.
 */
export function resolvePluginEntries(openapiConfig?: string, cliPlugins?: string[], activeInput?: string): NormalizedPluginEntry[] {
    const configData = loadConfigIfExists(openapiConfig);
    const config = convertArrayToObject(configData) as Record<string, unknown>;
    const configEntries = collectConfigPluginEntries(config, activeInput);
    return mergePluginPaths(configEntries.length > 0 ? configEntries : undefined, cliPlugins);
}
