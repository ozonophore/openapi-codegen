import { pathToFileURL } from 'node:url';

import { APP_LOGGER } from '../../common/Consts';
import { buildFactoryPlugin } from './buildFactoryPlugin';
import { OpenApiGeneratorPlugin, OpenApiPluginFactory, OpenApiPluginFactoryModule, OpenApiPluginFactoryWithMeta, OpenApiPluginMeta } from './GeneratorPlugin.model';
import { getBuiltinPlugins } from './getBuiltinPlugins';
import { normalizePluginEntry, type PluginConfigEntry } from './pluginEntries';
import { wrapLegacyPlugin } from './wrapLegacyPlugin';

export type LoadGeneratorPluginsOptions = {
    disableBuiltins?: boolean;
};

function isFactoryMeta(value: unknown): value is OpenApiPluginMeta {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const meta = value as OpenApiPluginMeta;
    return meta.apiVersion === '3' && typeof meta.name === 'string';
}

function isFactoryModule(value: unknown): value is OpenApiPluginFactoryModule {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value as OpenApiPluginFactoryModule;
    return isFactoryMeta(candidate.meta) && typeof candidate.createPlugin === 'function';
}

function isFactoryFunction(value: unknown): value is OpenApiPluginFactoryWithMeta {
    return typeof value === 'function' && isFactoryMeta((value as OpenApiPluginFactoryWithMeta).meta);
}

/**
 * Type guard for runtime plugin objects.
 */
function isOpenApiGeneratorPlugin(value: unknown): value is OpenApiGeneratorPlugin {
    return !!value && typeof value === 'object' && typeof (value as OpenApiGeneratorPlugin).name === 'string';
}

function hasCreatePlugin(value: object): boolean {
    return typeof (value as { createPlugin?: unknown }).createPlugin === 'function';
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
        APP_LOGGER.warn(
            `Plugin "${plugin.name}" declares unsupported apiVersion "${String(apiVersion)}". Supported versions are "1" and "2"; Plugin factory API uses apiVersion "3" with a factory export.`
        );
        return;
    }
    if (apiVersion == null && hasV2Hooks(plugin)) {
        APP_LOGGER.warn(`Plugin "${plugin.name}" implements analyze-diff hooks but omits apiVersion. Set apiVersion: "2" for Plugin API v2.`);
    }
}

async function materializePluginExport(plugin: unknown, pluginPath: string): Promise<OpenApiGeneratorPlugin> {
    if (isFactoryModule(plugin)) {
        return buildFactoryPlugin(plugin.createPlugin, plugin.meta);
    }

    if (isFactoryFunction(plugin)) {
        return buildFactoryPlugin(plugin as OpenApiPluginFactory, plugin.meta as OpenApiPluginMeta);
    }

    if (isOpenApiGeneratorPlugin(plugin)) {
        if (plugin.apiVersion === '3') {
            throw new Error(`Invalid plugin at "${pluginPath}": apiVersion "3" requires Plugin factory API ({ meta, createPlugin } or function with .meta)`);
        }
        if (hasCreatePlugin(plugin)) {
            throw new Error(`Invalid plugin at "${pluginPath}": export has both "name" and "createPlugin" without factory meta`);
        }
        warnPluginApiVersion(plugin);
        return plugin;
    }

    throw new Error(`Invalid plugin at "${pluginPath}": expected export with shape { name: string } or Plugin factory API`);
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
        const resolvedPath = entry.path;
        const moduleExports = await loadPluginModule(resolvedPath);
        const plugin = await materializePluginExport(getPluginFromModule(moduleExports), entry.path);
        if (typeof plugin.configure === 'function' && Object.keys(entry.config).length > 0) {
            await plugin.configure(entry.config);
        }
        loadedPlugins.push(wrapLegacyPlugin(plugin));
    }

    if (options?.disableBuiltins) {
        return loadedPlugins;
    }

    return [...loadedPlugins, ...getBuiltinPlugins().map(wrapLegacyPlugin)];
}
