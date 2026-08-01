import { existsSync } from 'node:fs';

import { resolveHelper } from '../../../common/utils/pathHelpers';
import { extractPluginPaths, type PluginConfigEntry } from '../../../core/plugins/pluginEntries';

/**
 * Warns when configured plugin module paths are missing on disk.
 */
export function validatePluginPaths(configData: Record<string, unknown>): string[] {
    const warnings: string[] = [];

    const collect = (plugins: unknown, itemLabel?: string): void => {
        if (!Array.isArray(plugins)) {
            return;
        }
        const prefix = itemLabel ? `Item "${itemLabel}": ` : '';
        for (const path of extractPluginPaths(plugins as PluginConfigEntry[])) {
            const resolved = resolveHelper(process.cwd(), path);
            if (!existsSync(resolved)) {
                warnings.push(`${prefix}plugin path does not exist: ${path}`);
            }
        }
    };

    collect(configData.plugins);

    const items = configData.items;
    if (Array.isArray(items)) {
        for (const item of items) {
            if (!item || typeof item !== 'object') {
                continue;
            }
            const record = item as Record<string, unknown>;
            const label = typeof record.input === 'string' ? record.input : undefined;
            collect(record.plugins, label);
        }
    }

    return warnings;
}
