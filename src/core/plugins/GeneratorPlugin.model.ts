import type { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';

/** OpenAPI specification version used by the generator parser. */
export type TOpenApiVersion = 'v2' | 'v3';

/**
 * Author-facing plugin API version marker.
 * Runtime always normalizes loaded plugins to v3.
 */
export type OpenApiCodegenPluginApiVersion = '1' | '2' | '3';

/** Execution flow that invokes a plugin hook. */
export type PluginExecutionMode = 'generate' | 'analyze-diff';

/** Diagnostic payload emitted by a plugin through {@link PluginRuntimeContext.emitDiagnostic}. */
export interface PluginRuntimeDiagnostic {
    /** Hook that produced the diagnostic. */
    hook: 'resolveSchemaTypeOverride' | 'afterSemanticDiff' | 'mapRecommendation' | 'beforeReportWrite';
    /** Whether the hook logic was applied, skipped, or failed. */
    status: 'applied' | 'skipped' | 'failed';
    /** Optional human-readable details. */
    message?: string;
}

/**
 * Shared runtime context passed as the second argument to every plugin hook.
 */
export interface PluginRuntimeContext {
    /** Current working directory of the generator process. */
    cwd: string;
    /** Active execution flow (`generate` or `analyze-diff`). */
    executionMode: PluginExecutionMode;
    /**
     * Optional callback for plugins to report hook-level diagnostics.
     * In `analyze-diff` the callback is wired to CLI diagnostics; in `generate` it is currently a no-op.
     */
    emitDiagnostic?: (diagnostic: PluginRuntimeDiagnostic) => void;
}

/** Parser context for schema type override resolution. */
export interface SchemaTypeOverrideContext {
    /** OpenAPI spec version of the parsed document. */
    openApiVersion: TOpenApiVersion;
    /** JSON Pointer / ref of the parent schema node. */
    parentRef: string;
}

/** Input for the `resolveSchemaTypeOverride` hook. */
export interface SchemaTypeOverrideInput {
    /** Raw OpenAPI schema object. */
    schema: Record<string, any>;
    /** Parser context for the schema node. */
    context: SchemaTypeOverrideContext;
}

/** Input for the `afterSemanticDiff` hook. */
export interface SemanticDiffPluginContext {
    /** Current semantic diff report produced by the analyzer. */
    report: SemanticDiffReport;
    options: {
        /** Whether breaking changes are allowed for this run. */
        allowBreaking: boolean;
    };
}

/** Input for the `mapRecommendation` hook. */
export interface RecommendationPluginContext {
    /** Current semver recommendation. */
    recommendation: SemanticDiffReport['recommendation'];
    /** Aggregated change counters from the diff report. */
    summary: SemanticDiffReport['summary'];
    /** Governance evaluation attached to the diff report. */
    governance: SemanticDiffReport['governance'];
}

/** Input for the `beforeReportWrite` hook. */
export interface BeforeReportWritePluginContext {
    /** Report that will be written to disk. */
    report: SemanticDiffReport;
    /** Target report file path. */
    reportPath: string;
}

/** Metadata required for v3 factory plugin exports. */
export interface OpenApiPluginMeta {
    /** Stable plugin identifier used in diagnostics and logs. */
    name: string;
    /** Optional plugin version for tooling and debugging. */
    version?: string;
    /** Must be `'3'` for factory plugin exports. */
    apiVersion: '3';
}

/** v3 handler for schema type overrides. Return `undefined` to defer to the next handler. */
export type SchemaTypeOverrideHandler = (input: SchemaTypeOverrideInput, runtime: PluginRuntimeContext) => string | undefined;

/** v3 handler that can replace the semantic diff report. */
export type AfterSemanticDiffHandler = (
    ctx: SemanticDiffPluginContext,
    runtime: PluginRuntimeContext
) => SemanticDiffReport | void | Promise<SemanticDiffReport | void>;

/** v3 handler that can replace the semver recommendation. */
export type MapRecommendationHandler = (
    ctx: RecommendationPluginContext,
    runtime: PluginRuntimeContext
) => SemanticDiffReport['recommendation'] | void | Promise<SemanticDiffReport['recommendation'] | void>;

/** v3 handler that can replace the report and/or output path before write. */
export type BeforeReportWriteHandler = (
    ctx: BeforeReportWritePluginContext,
    runtime: PluginRuntimeContext
) => { report?: SemanticDiffReport; reportPath?: string } | void | Promise<{ report?: SemanticDiffReport; reportPath?: string } | void>;

/**
 * Registration API exposed to v3 factory plugins during initialization.
 * Handlers registered for the same hook are composed sequentially at runtime.
 */
export interface PluginApi {
    /** Factory metadata attached to the plugin module. */
    readonly meta: OpenApiPluginMeta;
    /** Registers a handler for `resolveSchemaTypeOverride` (first non-empty result wins). */
    onSchemaTypeOverride: (handler: SchemaTypeOverrideHandler) => void;
    /** Registers a handler for `afterSemanticDiff`. */
    onAfterSemanticDiff: (handler: AfterSemanticDiffHandler) => void;
    /** Registers a handler for `mapRecommendation`. */
    onMapRecommendation: (handler: MapRecommendationHandler) => void;
    /** Registers a handler for `beforeReportWrite`. */
    onBeforeReportWrite: (handler: BeforeReportWriteHandler) => void;
}

/**
 * v3 factory function that registers hooks through {@link PluginApi}.
 * May be synchronous or async.
 */
export type OpenApiPluginFactory = (api: PluginApi) => void | Promise<void>;

/** CommonJS/ESM module export shape for v3 factory plugins. */
export interface OpenApiPluginFactoryModule {
    meta: OpenApiPluginMeta;
    createPlugin: OpenApiPluginFactory;
}

/** Function export shape for v3 factory plugins with metadata attached to the function. */
export interface OpenApiPluginFactoryWithMeta extends OpenApiPluginFactory {
    meta?: OpenApiPluginMeta;
}

/**
 * Normalized runtime plugin contract used by generate and analyze-diff flows.
 * Legacy v1/v2 author exports are adapted to this shape at load time.
 */
export interface OpenApiGeneratorPlugin {
    name: string;
    version?: string;
    /** Runtime API version. Normalized plugins always use `'3'`. */
    apiVersion?: OpenApiCodegenPluginApiVersion;
    /** Overrides generated TypeScript type for a schema (generate flow). */
    resolveSchemaTypeOverride?: (input: SchemaTypeOverrideInput, runtimeContext?: PluginRuntimeContext) => string | undefined;
    /** Mutates semantic diff report after analysis (analyze-diff flow). */
    afterSemanticDiff?: (ctx: SemanticDiffPluginContext, runtimeContext?: PluginRuntimeContext) => SemanticDiffReport | void | Promise<SemanticDiffReport | void>;
    /** Mutates semver recommendation (analyze-diff flow). */
    mapRecommendation?: (
        ctx: RecommendationPluginContext,
        runtimeContext?: PluginRuntimeContext
    ) => SemanticDiffReport['recommendation'] | void | Promise<SemanticDiffReport['recommendation'] | void>;
    /** Mutates report payload/path before write (analyze-diff flow). */
    beforeReportWrite?: (
        ctx: BeforeReportWritePluginContext,
        runtimeContext?: PluginRuntimeContext
    ) => { report?: SemanticDiffReport; reportPath?: string } | void | Promise<{ report?: SemanticDiffReport; reportPath?: string } | void>;
}
