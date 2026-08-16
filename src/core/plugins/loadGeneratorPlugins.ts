import { pathToFileURL } from 'node:url';

import { APP_LOGGER } from '../../common/Consts';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { OpenApiGeneratorPlugin } from './GeneratorPlugin.model';
import { getBuiltinPlugins } from './getBuiltinPlugins';
import { normalizePluginEntry, type PluginConfigEntry } from './pluginEntries';

export type LoadGeneratorPluginsOptions = {
    disableBuiltins?: boolean;
};

/**
 * Type guard for runtime plugin objects.
 */
function isOpenApiGeneratorPlugin(value: unknown): value is OpenApiGeneratorPlugin {
    return !!value && typeof value === 'object' && typeof (value as OpenApiGeneratorPlugin).name === 'string';
}

/**
 * Resolves plugin export from a required module.
 */
function getPluginFromModule(moduleExports: unknown): unknown {
    const exported = moduleExports as Record<string, unknown>;
    return exported?.default ?? exported?.plugin ?? moduleExports;
}

/**
 * Checks whether loader can fallback from require() to dynamic import().
 */
function canFallbackToDynamicImport(error: unknown): boolean {
    const errorCode = typeof error === 'object' && error && 'code' in error ? String((error as Record<string, unknown>).code) : '';
    const errorMessage = error instanceof Error ? error.message : '';

    return (
        errorCode === 'ERR_REQUIRE_ESM' ||
        errorCode === 'ERR_UNKNOWN_FILE_EXTENSION' ||
        errorMessage.includes('Cannot use import statement outside a module') ||
        errorMessage.includes('Unexpected token export')
    );
}

/**
 * Loads a plugin module from a file path using require() with import() fallback.
 */
async function loadPluginModule(pluginPath: string): Promise<unknown> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(pluginPath);
    } catch (error) {
        if (!canFallbackToDynamicImport(error)) {
            throw error;
        }
        return import(pathToFileURL(pluginPath).href);
    }
}

function hasV2Hooks(plugin: OpenApiGeneratorPlugin): boolean {
    return !!(plugin.afterSemanticDiff || plugin.mapRecommendation || plugin.beforeReportWrite);
}

function warnPluginApiVersion(plugin: OpenApiGeneratorPlugin): void {
    const apiVersion = plugin.apiVersion;
    if (apiVersion != null && apiVersion !== '1' && apiVersion !== '2') {
        APP_LOGGER.warn(`Plugin "${plugin.name}" declares unsupported apiVersion "${String(apiVersion)}". Supported versions are "1" and "2"; Plugin API v3 factory is not shipped.`);
        return;
    }
    if (apiVersion == null && hasV2Hooks(plugin)) {
        APP_LOGGER.warn(`Plugin "${plugin.name}" implements analyze-diff hooks but omits apiVersion. Set apiVersion: "2" for Plugin API v2.`);
    }
}

/**
 * Loads user plugins (injecting non-empty entry config via `configure`) and appends built-ins.
 */
export async function loadGeneratorPlugins(entries: readonly PluginConfigEntry[], options?: LoadGeneratorPluginsOptions): Promise<OpenApiGeneratorPlugin[]> {
    const loadedPlugins: OpenApiGeneratorPlugin[] = [];

    for (const rawEntry of entries) {
        const entry = normalizePluginEntry(rawEntry);
        if (!entry) {
            continue;
        }
        const resolvedPath = resolveHelper(process.cwd(), entry.path);
        const moduleExports = await loadPluginModule(resolvedPath);
        const plugin = getPluginFromModule(moduleExports);
        if (!isOpenApiGeneratorPlugin(plugin)) {
            throw new Error(`Invalid plugin at "${entry.path}": expected export with shape { name: string }`);
        }
        warnPluginApiVersion(plugin);
        if (typeof plugin.configure === 'function' && Object.keys(entry.config).length > 0) {
            await plugin.configure(entry.config);
        }
        loadedPlugins.push(plugin);
    }

    if (options?.disableBuiltins) {
        return loadedPlugins;
    }

    return [...loadedPlugins, ...getBuiltinPlugins()];
}
