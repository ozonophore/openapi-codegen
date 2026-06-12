import type { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';

export type TOpenApiVersion = 'v2' | 'v3';
export type OpenApiCodegenPluginApiVersion = '1' | '2' | '3';
export type PluginExecutionMode = 'generate' | 'analyze-diff';

export interface PluginRuntimeDiagnostic {
    hook: 'resolveSchemaTypeOverride' | 'afterSemanticDiff' | 'mapRecommendation' | 'beforeReportWrite';
    status: 'applied' | 'skipped' | 'failed';
    message?: string;
}

export interface PluginRuntimeContext {
    cwd: string;
    executionMode: PluginExecutionMode;
    emitDiagnostic?: (diagnostic: PluginRuntimeDiagnostic) => void;
}

export interface SchemaTypeOverrideContext {
    openApiVersion: TOpenApiVersion;
    parentRef: string;
}

export interface SchemaTypeOverrideInput {
    schema: Record<string, any>;
    context: SchemaTypeOverrideContext;
}

export interface SemanticDiffPluginContext {
    report: SemanticDiffReport;
    options: {
        allowBreaking: boolean;
    };
}

export interface RecommendationPluginContext {
    recommendation: SemanticDiffReport['recommendation'];
    summary: SemanticDiffReport['summary'];
    governance: SemanticDiffReport['governance'];
}

export interface BeforeReportWritePluginContext {
    report: SemanticDiffReport;
    reportPath: string;
}

export interface OpenApiPluginMeta {
    name: string;
    version?: string;
    apiVersion: '3';
}

export type SchemaTypeOverrideHandler = (input: SchemaTypeOverrideInput, runtime: PluginRuntimeContext) => string | undefined;
export type AfterSemanticDiffHandler = (
    ctx: SemanticDiffPluginContext,
    runtime: PluginRuntimeContext
) => SemanticDiffReport | void | Promise<SemanticDiffReport | void>;
export type MapRecommendationHandler = (
    ctx: RecommendationPluginContext,
    runtime: PluginRuntimeContext
) => SemanticDiffReport['recommendation'] | void | Promise<SemanticDiffReport['recommendation'] | void>;
export type BeforeReportWriteHandler = (
    ctx: BeforeReportWritePluginContext,
    runtime: PluginRuntimeContext
) => { report?: SemanticDiffReport; reportPath?: string } | void | Promise<{ report?: SemanticDiffReport; reportPath?: string } | void>;

export interface PluginApi {
    readonly meta: OpenApiPluginMeta;
    onSchemaTypeOverride: (handler: SchemaTypeOverrideHandler) => void;
    onAfterSemanticDiff: (handler: AfterSemanticDiffHandler) => void;
    onMapRecommendation: (handler: MapRecommendationHandler) => void;
    onBeforeReportWrite: (handler: BeforeReportWriteHandler) => void;
}

export type OpenApiPluginFactory = (api: PluginApi) => void | Promise<void>;

export interface OpenApiPluginFactoryModule {
    meta: OpenApiPluginMeta;
    createPlugin: OpenApiPluginFactory;
}

export interface OpenApiPluginFactoryWithMeta extends OpenApiPluginFactory {
    meta?: OpenApiPluginMeta;
}

export interface OpenApiGeneratorPlugin {
    name: string;
    version?: string;
    apiVersion?: OpenApiCodegenPluginApiVersion;
    resolveSchemaTypeOverride?: (input: SchemaTypeOverrideInput, runtimeContext?: PluginRuntimeContext) => string | undefined;
    afterSemanticDiff?: (ctx: SemanticDiffPluginContext, runtimeContext?: PluginRuntimeContext) => SemanticDiffReport | void | Promise<SemanticDiffReport | void>;
    mapRecommendation?: (
        ctx: RecommendationPluginContext,
        runtimeContext?: PluginRuntimeContext
    ) => SemanticDiffReport['recommendation'] | void | Promise<SemanticDiffReport['recommendation'] | void>;
    beforeReportWrite?: (
        ctx: BeforeReportWritePluginContext,
        runtimeContext?: PluginRuntimeContext
    ) => { report?: SemanticDiffReport; reportPath?: string } | void | Promise<{ report?: SemanticDiffReport; reportPath?: string } | void>;
}
