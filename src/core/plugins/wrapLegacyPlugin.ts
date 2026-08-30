import { OpenApiGeneratorPlugin } from './GeneratorPlugin.model';

/**
 * In-place wrap: v1/v2 objects become runtime apiVersion '3'. Factory plugins are left as-is.
 */
export function wrapLegacyPlugin(plugin: OpenApiGeneratorPlugin): OpenApiGeneratorPlugin {
    if (plugin.apiVersion === '3') {
        return plugin;
    }

    const originalConfigure = plugin.configure;
    if (originalConfigure) {
        plugin.configure = function (config) {
            return originalConfigure.call(plugin, config);
        };
    }

    const originalOverride = plugin.resolveSchemaTypeOverride;
    if (originalOverride) {
        plugin.resolveSchemaTypeOverride = function (input, runtimeContext) {
            return originalOverride.call(plugin, input, runtimeContext);
        };
    }

    const originalAfterSemanticDiff = plugin.afterSemanticDiff;
    if (originalAfterSemanticDiff) {
        plugin.afterSemanticDiff = function (ctx, runtimeContext) {
            return originalAfterSemanticDiff.call(plugin, ctx, runtimeContext);
        };
    }

    const originalMapRecommendation = plugin.mapRecommendation;
    if (originalMapRecommendation) {
        plugin.mapRecommendation = function (ctx, runtimeContext) {
            return originalMapRecommendation.call(plugin, ctx, runtimeContext);
        };
    }

    const originalBeforeReportWrite = plugin.beforeReportWrite;
    if (originalBeforeReportWrite) {
        plugin.beforeReportWrite = function (ctx, runtimeContext) {
            return originalBeforeReportWrite.call(plugin, ctx, runtimeContext);
        };
    }

    plugin.apiVersion = '3';
    return plugin;
}
