import { pathToFileURL } from 'node:url';

import { resolveHelper } from '../../common/utils/pathHelpers';
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
    PluginRuntimeContext,
} from './GeneratorPlugin.model';
import { getBuiltinPlugins } from './getBuiltinPlugins';

/**
 * Type guard for runtime plugin objects.
 */
function isOpenApiGeneratorPlugin(value: unknown): value is OpenApiGeneratorPlugin {
    return !!value && typeof value === 'object' && typeof (value as OpenApiGeneratorPlugin).name === 'string';
}

function isFactoryModule(value: unknown): value is OpenApiPluginFactoryModule {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value as OpenApiPluginFactoryModule;
    return !!candidate.meta && candidate.meta.apiVersion === '3' && typeof candidate.meta.name === 'string' && typeof candidate.createPlugin === 'function';
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

function createRuntimeContext(base: PluginRuntimeContext, mode: PluginRuntimeContext['executionMode']): PluginRuntimeContext {
    return {
        ...base,
        executionMode: mode,
    };
}

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

    const normalizedPlugin: OpenApiGeneratorPlugin = {
        name: meta.name,
        version: meta.version,
        apiVersion: '3',
    };

    if (schemaTypeOverrideHandlers.length > 0) {
        normalizedPlugin.resolveSchemaTypeOverride = (input, runtimeContext = { cwd: process.cwd(), executionMode: 'generate' }) => {
            for (const handler of schemaTypeOverrideHandlers) {
                const result = handler(input, createRuntimeContext(runtimeContext, 'generate'));
                if (typeof result === 'string' && result.trim()) {
                    return result.trim();
                }
            }
            return undefined;
        };
    }

    if (afterSemanticDiffHandlers.length > 0) {
        normalizedPlugin.afterSemanticDiff = async (ctx, runtimeContext = { cwd: process.cwd(), executionMode: 'analyze-diff' }) => {
            let currentReport = ctx.report;
            let wasApplied = false;
            for (const handler of afterSemanticDiffHandlers) {
                const result = await handler(
                    {
                        ...ctx,
                        report: currentReport,
                    },
                    createRuntimeContext(runtimeContext, 'analyze-diff')
                );
                if (result) {
                    currentReport = result;
                    wasApplied = true;
                }
            }
            return wasApplied ? currentReport : undefined;
        };
    }

    if (mapRecommendationHandlers.length > 0) {
        normalizedPlugin.mapRecommendation = async (ctx, runtimeContext = { cwd: process.cwd(), executionMode: 'analyze-diff' }) => {
            let currentRecommendation = ctx.recommendation;
            let wasApplied = false;
            for (const handler of mapRecommendationHandlers) {
                const result = await handler(
                    {
                        ...ctx,
                        recommendation: currentRecommendation,
                    },
                    createRuntimeContext(runtimeContext, 'analyze-diff')
                );
                if (result) {
                    currentRecommendation = result;
                    wasApplied = true;
                }
            }
            return wasApplied ? currentRecommendation : undefined;
        };
    }

    if (beforeReportWriteHandlers.length > 0) {
        normalizedPlugin.beforeReportWrite = async (ctx, runtimeContext = { cwd: process.cwd(), executionMode: 'analyze-diff' }) => {
            let currentReport = ctx.report;
            let currentReportPath = ctx.reportPath;
            let wasApplied = false;

            for (const handler of beforeReportWriteHandlers) {
                const result = await handler(
                    {
                        report: currentReport,
                        reportPath: currentReportPath,
                    },
                    createRuntimeContext(runtimeContext, 'analyze-diff')
                );
                if (result?.report) {
                    currentReport = result.report;
                    wasApplied = true;
                }
                if (result?.reportPath) {
                    currentReportPath = result.reportPath;
                    wasApplied = true;
                }
            }

            return wasApplied
                ? {
                      report: currentReport,
                      reportPath: currentReportPath,
                  }
                : undefined;
        };
    }

    return normalizedPlugin;
}

async function normalizePluginEntry(plugin: unknown, pluginPath: string): Promise<OpenApiGeneratorPlugin> {
    if (isOpenApiGeneratorPlugin(plugin)) {
        return plugin;
    }

    if (isFactoryModule(plugin)) {
        return buildPluginFromFactory(plugin.createPlugin, plugin.meta);
    }

    if (typeof plugin === 'function') {
        const factory = plugin as OpenApiPluginFactoryWithMeta;
        if (!factory.meta || factory.meta.apiVersion !== '3' || typeof factory.meta.name !== 'string') {
            throw new Error(`Invalid plugin at "${pluginPath}": v3 factory export must include "meta" with { name: string, apiVersion: '3' }`);
        }
        return buildPluginFromFactory(factory, factory.meta);
    }

    throw new Error(`Invalid plugin at "${pluginPath}": expected legacy plugin object or v3 factory plugin export`);
}

/**
 * Loads user plugins and appends built-in plugins as fallback handlers.
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
