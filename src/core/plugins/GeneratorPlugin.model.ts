import type { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';

export type TOpenApiVersion = 'v2' | 'v3';
export type OpenApiCodegenPluginApiVersion = '1' | '2';

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

export interface OpenApiGeneratorPlugin {
    name: string;
    version?: string;
    apiVersion?: OpenApiCodegenPluginApiVersion;
    resolveSchemaTypeOverride?: (input: SchemaTypeOverrideInput) => string | undefined;
    afterSemanticDiff?: (ctx: SemanticDiffPluginContext) => SemanticDiffReport | void | Promise<SemanticDiffReport | void>;
    mapRecommendation?: (
        ctx: RecommendationPluginContext
    ) => SemanticDiffReport['recommendation'] | void | Promise<SemanticDiffReport['recommendation'] | void>;
    beforeReportWrite?: (
        ctx: BeforeReportWritePluginContext
    ) => { report?: SemanticDiffReport; reportPath?: string } | void | Promise<{ report?: SemanticDiffReport; reportPath?: string } | void>;
}
