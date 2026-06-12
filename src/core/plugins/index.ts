/**
 * Public plugin API surface for generator and analyze-diff flows.
 * All loaded plugins are normalized to the v3 runtime contract.
 */
export type { ApplySemanticDiffPluginHooksResult, PluginHookDiagnostic, PluginHookName } from './applySemanticDiffPluginHooks';
export { applySemanticDiffPluginHooks } from './applySemanticDiffPluginHooks';
export type {
    OpenApiGeneratorPlugin,
    OpenApiPluginFactory,
    OpenApiPluginFactoryModule,
    OpenApiPluginMeta,
    PluginApi,
    PluginRuntimeContext,
    SchemaTypeOverrideContext,
    SchemaTypeOverrideInput,
    TOpenApiVersion,
} from './GeneratorPlugin.model';
