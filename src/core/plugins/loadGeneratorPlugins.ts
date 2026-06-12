import { pathToFileURL } from 'node:url';

import { resolveHelper } from '../../common/utils/pathHelpers';
import { buildNormalizedPlugin, wrapLegacyPlugin } from './buildNormalizedPlugin';
import {
    AfterSemanticDiffHandler,
    BeforeReportWriteHandler,
    MapRecommendationHandler,
    OpenApiGeneratorPlugin,
    OpenApiPluginFactory,
    OpenApiPluginFactoryModule,
    OpenApiPluginFactoryWithMeta,
    PluginApi,
    SchemaTypeOverrideHandler,
} from './GeneratorPlugin.model';
import { getBuiltinPlugins } from './getBuiltinPlugins';

/**
 * Type guard for legacy plugin objects (`{ name: string, ...hooks }`).
 */
function isLegacyPluginObject(value: unknown): value is OpenApiGeneratorPlugin {
    return !!value && typeof value === 'object' && typeof (value as OpenApiGeneratorPlugin).name === 'string';
}

/**
 * Type guard for v3 factory module exports (`{ meta, createPlugin }`).
 */
function isFactoryModule(value: unknown): value is OpenApiPluginFactoryModule {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value as OpenApiPluginFactoryModule;
    return !!candidate.meta && candidate.meta.apiVersion === '3' && typeof candidate.meta.name === 'string' && typeof candidate.createPlugin === 'function';
}

/**
 * Detects invalid hybrid export that mixes legacy `name` with factory `createPlugin`.
 */
function hasLegacyFactoryConflict(value: OpenApiGeneratorPlugin): boolean {
    return typeof (value as Record<string, unknown>).createPlugin === 'function';
}

/**
 * Resolves plugin export from a loaded module.
 * Supports `default`, named `plugin`, or direct module export.
 */
function getPluginFromModule(moduleExports: unknown): unknown {
    const exported = moduleExports as Record<string, unknown>;
    return exported?.default ?? exported?.plugin ?? moduleExports;
}

/**
 * Checks whether loader can fallback from `require()` to dynamic `import()`.
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
 * Loads a plugin module from a file path using `require()` with `import()` fallback.
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

/**
 * Executes a v3 factory, collects registered handlers, and returns a normalized plugin.
 */
async function buildPluginFromFactory(factory: OpenApiPluginFactory, meta: OpenApiPluginFactoryModule['meta']): Promise<OpenApiGeneratorPlugin> {
    const schemaTypeOverrideHandlers: SchemaTypeOverrideHandler[] = [];
    const afterSemanticDiffHandlers: AfterSemanticDiffHandler[] = [];
    const mapRecommendationHandlers: MapRecommendationHandler[] = [];
    const beforeReportWriteHandlers: BeforeReportWriteHandler[] = [];

    const api: PluginApi = {
        meta,
        onSchemaTypeOverride: handler => {
            schemaTypeOverrideHandlers.push(handler);
        },
        onAfterSemanticDiff: handler => {
            afterSemanticDiffHandlers.push(handler);
        },
        onMapRecommendation: handler => {
            mapRecommendationHandlers.push(handler);
        },
        onBeforeReportWrite: handler => {
            beforeReportWriteHandlers.push(handler);
        },
    };

    await factory(api);

    return buildNormalizedPlugin(meta, {
        schemaTypeOverrideHandlers,
        afterSemanticDiffHandlers,
        mapRecommendationHandlers,
        beforeReportWriteHandlers,
    });
}

/**
 * Normalizes a raw module export to the shared v3 runtime plugin contract.
 *
 * Supported export shapes:
 * 1. v3 factory function with attached `meta`;
 * 2. v3 module object `{ meta, createPlugin }`;
 * 3. legacy v1/v2 object `{ name, ...hooks }`.
 */
async function normalizePluginEntry(plugin: unknown, pluginPath: string): Promise<OpenApiGeneratorPlugin> {
    if (typeof plugin === 'function') {
        const factory = plugin as OpenApiPluginFactoryWithMeta;
        if (!factory.meta || factory.meta.apiVersion !== '3' || typeof factory.meta.name !== 'string') {
            throw new Error(`Invalid plugin at "${pluginPath}": v3 factory export must include "meta" with { name: string, apiVersion: '3' }`);
        }
        try {
            return await buildPluginFromFactory(factory, factory.meta);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize plugin at "${pluginPath}": ${message}`, { cause: error });
        }
    }

    if (isFactoryModule(plugin)) {
        try {
            return await buildPluginFromFactory(plugin.createPlugin, plugin.meta);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize plugin at "${pluginPath}": ${message}`, { cause: error });
        }
    }

    if (isLegacyPluginObject(plugin)) {
        if (hasLegacyFactoryConflict(plugin)) {
            throw new Error(
                `Invalid plugin at "${pluginPath}": object has both legacy "name" and "createPlugin". Use v3 factory export shape { meta, createPlugin } without top-level "name".`
            );
        }
        return wrapLegacyPlugin(plugin);
    }

    throw new Error(`Invalid plugin at "${pluginPath}": expected legacy plugin object or v3 factory plugin export`);
}

/**
 * Loads user plugins from config paths and appends built-in plugins as fallback handlers.
 *
 * Every returned plugin is normalized to `apiVersion: '3'`.
 * User plugins are listed first; built-in plugins run after them.
 *
 * @param pluginPaths - Relative or absolute paths from `openapi.config.json`.
 */
export async function loadGeneratorPlugins(pluginPaths: string[]): Promise<OpenApiGeneratorPlugin[]> {
    const loadedPlugins: OpenApiGeneratorPlugin[] = [];

    for (const pluginPath of pluginPaths) {
        const resolvedPath = resolveHelper(process.cwd(), pluginPath);
        const moduleExports = await loadPluginModule(resolvedPath);
        const plugin = getPluginFromModule(moduleExports);
        loadedPlugins.push(await normalizePluginEntry(plugin, pluginPath));
    }

    return [...loadedPlugins, ...getBuiltinPlugins()];
}
