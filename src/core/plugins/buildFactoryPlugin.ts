import {
    AfterSemanticDiffHandler,
    BeforeReportWriteHandler,
    MapRecommendationHandler,
    OpenApiGeneratorPlugin,
    OpenApiPluginFactory,
    OpenApiPluginMeta,
    PluginApi,
    PluginConfigureHandler,
    PluginRuntimeContext,
    SchemaTypeOverrideHandler,
} from './GeneratorPlugin.model';

function defaultRuntime(executionMode: PluginRuntimeContext['executionMode']): PluginRuntimeContext {
    return {
        cwd: process.cwd(),
        executionMode,
    };
}

function registerOnce<T>(hookName: string, slot: { handler?: T }): (handler: T) => void {
    return handler => {
        if (slot.handler) {
            throw new Error(`PluginApi.${hookName} already registered`);
        }
        slot.handler = handler;
    };
}

type FactorySlots = {
    configure: { handler?: PluginConfigureHandler };
    schemaTypeOverride: { handler?: SchemaTypeOverrideHandler };
    afterSemanticDiff: { handler?: AfterSemanticDiffHandler };
    mapRecommendation: { handler?: MapRecommendationHandler };
    beforeReportWrite: { handler?: BeforeReportWriteHandler };
};

function createFactoryApi(meta: OpenApiPluginMeta, slots: FactorySlots): PluginApi {
    return {
        meta,
        onConfigure: registerOnce('onConfigure', slots.configure),
        onSchemaTypeOverride: registerOnce('onSchemaTypeOverride', slots.schemaTypeOverride),
        onAfterSemanticDiff: registerOnce('onAfterSemanticDiff', slots.afterSemanticDiff),
        onMapRecommendation: registerOnce('onMapRecommendation', slots.mapRecommendation),
        onBeforeReportWrite: registerOnce('onBeforeReportWrite', slots.beforeReportWrite),
    };
}

function materializeFactoryPlugin(meta: OpenApiPluginMeta, slots: FactorySlots): OpenApiGeneratorPlugin {
    const plugin: OpenApiGeneratorPlugin = {
        name: meta.name,
        version: meta.version,
        apiVersion: '3',
    };

    if (slots.configure.handler) {
        plugin.configure = slots.configure.handler;
    }

    if (slots.schemaTypeOverride.handler) {
        const handler = slots.schemaTypeOverride.handler;
        plugin.resolveSchemaTypeOverride = (input, runtimeContext = defaultRuntime('generate')) => handler(input, runtimeContext);
    }

    if (slots.afterSemanticDiff.handler) {
        const handler = slots.afterSemanticDiff.handler;
        plugin.afterSemanticDiff = (ctx, runtimeContext = defaultRuntime('analyze-diff')) => handler(ctx, runtimeContext);
    }

    if (slots.mapRecommendation.handler) {
        const handler = slots.mapRecommendation.handler;
        plugin.mapRecommendation = (ctx, runtimeContext = defaultRuntime('analyze-diff')) => handler(ctx, runtimeContext);
    }

    if (slots.beforeReportWrite.handler) {
        const handler = slots.beforeReportWrite.handler;
        plugin.beforeReportWrite = (ctx, runtimeContext = defaultRuntime('analyze-diff')) => handler(ctx, runtimeContext);
    }

    return plugin;
}

function emptySlots(): FactorySlots {
    return {
        configure: {},
        schemaTypeOverride: {},
        afterSemanticDiff: {},
        mapRecommendation: {},
        beforeReportWrite: {},
    };
}

/**
 * Runs Plugin factory API `createPlugin` and materializes an OpenApiGeneratorPlugin.
 */
export async function buildFactoryPlugin(factory: OpenApiPluginFactory, meta: OpenApiPluginMeta): Promise<OpenApiGeneratorPlugin> {
    const slots = emptySlots();
    await factory(createFactoryApi(meta, slots));
    return materializeFactoryPlugin(meta, slots);
}

/**
 * Sync factory materialize. `createPlugin` MUST NOT return a Promise.
 */
export function buildFactoryPluginSync(factory: OpenApiPluginFactory, meta: OpenApiPluginMeta): OpenApiGeneratorPlugin {
    const slots = emptySlots();
    const result = factory(createFactoryApi(meta, slots));
    if (result != null && typeof (result as Promise<void>).then === 'function') {
        throw new Error(`Plugin "${meta.name}" createPlugin must be synchronous for buildFactoryPluginSync`);
    }
    return materializeFactoryPlugin(meta, slots);
}
