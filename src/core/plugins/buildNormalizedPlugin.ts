import {
    AfterSemanticDiffHandler,
    BeforeReportWriteHandler,
    MapRecommendationHandler,
    OpenApiGeneratorPlugin,
    OpenApiPluginMeta,
    SchemaTypeOverrideHandler,
    PluginRuntimeContext,
} from './GeneratorPlugin.model';

/**
 * Handlers collected from a v3 factory or adapted from a legacy plugin object.
 */
export type CollectedPluginHandlers = {
    schemaTypeOverrideHandlers?: SchemaTypeOverrideHandler[];
    afterSemanticDiffHandlers?: AfterSemanticDiffHandler[];
    mapRecommendationHandlers?: MapRecommendationHandler[];
    beforeReportWriteHandlers?: BeforeReportWriteHandler[];
};

/**
 * Clones runtime context and enforces the execution mode for the active hook pipeline.
 */
function createRuntimeContext(base: PluginRuntimeContext, mode: PluginRuntimeContext['executionMode']): PluginRuntimeContext {
    return {
        ...base,
        executionMode: mode,
    };
}

/**
 * Builds a normalized v3 {@link OpenApiGeneratorPlugin} from registered hook handlers.
 *
 * Hook composition rules:
 * - `resolveSchemaTypeOverride`: first non-empty string wins;
 * - other hooks: sequential composition, each step receives the previous result.
 *
 * @param meta - Plugin identity used in runtime and diagnostics.
 * @param handlers - Hook handlers collected from factory registration or legacy adaptation.
 */
export function buildNormalizedPlugin(
    meta: Pick<OpenApiPluginMeta, 'name' | 'version'>,
    handlers: CollectedPluginHandlers
): OpenApiGeneratorPlugin {
    const {
        schemaTypeOverrideHandlers = [],
        afterSemanticDiffHandlers = [],
        mapRecommendationHandlers = [],
        beforeReportWriteHandlers = [],
    } = handlers;

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

/**
 * Adapts legacy v1/v2 plugin objects to the normalized v3 runtime shape.
 * Plugins that already have `apiVersion: '3'` are returned unchanged.
 *
 * @param legacy - Author-facing legacy plugin export.
 */
export function wrapLegacyPlugin(legacy: OpenApiGeneratorPlugin): OpenApiGeneratorPlugin {
    if (legacy.apiVersion === '3') {
        return legacy;
    }

    const handlers: CollectedPluginHandlers = {};

    if (legacy.resolveSchemaTypeOverride) {
        const legacyHook = legacy.resolveSchemaTypeOverride;
        handlers.schemaTypeOverrideHandlers = [(input, runtime) => legacyHook(input, runtime)];
    }

    if (legacy.afterSemanticDiff) {
        const legacyHook = legacy.afterSemanticDiff;
        handlers.afterSemanticDiffHandlers = [(ctx, runtime) => legacyHook(ctx, runtime)];
    }

    if (legacy.mapRecommendation) {
        const legacyHook = legacy.mapRecommendation;
        handlers.mapRecommendationHandlers = [(ctx, runtime) => legacyHook(ctx, runtime)];
    }

    if (legacy.beforeReportWrite) {
        const legacyHook = legacy.beforeReportWrite;
        handlers.beforeReportWriteHandlers = [(ctx, runtime) => legacyHook(ctx, runtime)];
    }

    return buildNormalizedPlugin({ name: legacy.name, version: legacy.version }, handlers);
}
