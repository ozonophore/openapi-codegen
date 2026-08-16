/**
 * Config / CLI plugin entry shapes and merge helpers.
 */

import { resolveHelper } from '../../common/utils/pathHelpers';

export type PluginConfigObject = {
    path: string;
    name?: string;
    config?: Record<string, unknown>;
};

export type PluginConfigEntry = string | PluginConfigObject;

export type NormalizedPluginEntry = {
    path: string;
    name?: string;
    config: Record<string, unknown>;
};

/**
 * Normalizes a config or CLI plugin entry to a path + optional name/config.
 */
export function normalizePluginEntry(entry: PluginConfigEntry): NormalizedPluginEntry | null {
    if (typeof entry === 'string') {
        const path = entry.trim();
        if (!path) {
            return null;
        }
        return { path, config: {} };
    }
    if (!entry || typeof entry !== 'object' || typeof entry.path !== 'string') {
        return null;
    }
    const path = entry.path.trim();
    if (!path) {
        return null;
    }
    return {
        path,
        name: typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : undefined,
        config: entry.config && typeof entry.config === 'object' ? entry.config : {},
    };
}

/**
 * Merges config plugin entries with CLI paths: config first, then CLI; dedupe by path.
 */
function pluginPathDedupeKey(path: string): string {
    // CLI merge can run before normalizePathsToAbsolute; resolve so ./a and a collide.
    return resolveHelper(process.cwd(), path);
}

export function mergePluginPaths(configEntries?: readonly PluginConfigEntry[] | null, cliPaths?: readonly string[] | null): NormalizedPluginEntry[] {
    const merged: NormalizedPluginEntry[] = [];
    const seen = new Set<string>();

    const append = (entry: PluginConfigEntry): void => {
        const normalized = normalizePluginEntry(entry);
        if (!normalized) {
            return;
        }
        const dedupeKey = pluginPathDedupeKey(normalized.path);
        if (seen.has(dedupeKey)) {
            return;
        }
        seen.add(dedupeKey);
        merged.push(normalized);
    };

    for (const entry of configEntries ?? []) {
        append(entry);
    }
    for (const path of cliPaths ?? []) {
        append(path);
    }

    return merged;
}

/**
 * Extracts loadable file paths from plugin entries (string or object).
 */
export function extractPluginPaths(entries?: readonly PluginConfigEntry[] | null): string[] {
    return mergePluginPaths(entries, null).map(entry => entry.path);
}
