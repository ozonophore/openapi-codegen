import { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';
import { wrapLegacyPlugin } from './buildNormalizedPlugin';
import { OpenApiGeneratorPlugin, PluginRuntimeContext } from './GeneratorPlugin.model';

/** Supported analyze-diff plugin hook names, including generate-only hook for diagnostic typing. */
export type PluginHookName = 'resolveSchemaTypeOverride' | 'afterSemanticDiff' | 'mapRecommendation' | 'beforeReportWrite';

/** Diagnostic record produced for each plugin hook invocation in analyze-diff. */
export type PluginHookDiagnostic = {
    pluginName: string;
    hook: PluginHookName;
    status: 'applied' | 'skipped' | 'failed';
    durationMs: number;
    message?: string;
};

/** Input for {@link applySemanticDiffPluginHooks}. */
export type ApplySemanticDiffPluginHooksInput = {
    report: SemanticDiffReport;
    reportPath: string;
    plugins: OpenApiGeneratorPlugin[];
    allowBreaking: boolean;
    /** When true, any hook error fails the command. Default: false. */
    strictPluginMode?: boolean;
    /** Optional callback invoked for each hook diagnostic. */
    onDiagnostic?: (diagnostic: PluginHookDiagnostic) => void;
};

/** Result of {@link applySemanticDiffPluginHooks}. */
export type ApplySemanticDiffPluginHooksResult = {
    report: SemanticDiffReport;
    reportPath: string;
    diagnostics: PluginHookDiagnostic[];
};

/**
 * Applies analyze-diff plugin hooks in deterministic order:
 * `afterSemanticDiff` → `mapRecommendation` → `beforeReportWrite`.
 *
 * Hooks are executed per plugin in config order. Each subsequent plugin receives
 * the output produced by previous plugins in the same hook stage.
 *
 * Legacy v1/v2 plugin objects are normalized to v3 before execution.
 *
 * @param input - Semantic diff report, plugin list, and runtime options.
 */
export async function applySemanticDiffPluginHooks(input: ApplySemanticDiffPluginHooksInput): Promise<ApplySemanticDiffPluginHooksResult> {
    const diagnostics: PluginHookDiagnostic[] = [];
    const strictPluginMode = input.strictPluginMode ?? false;
    const plugins = input.plugins.map(plugin => wrapLegacyPlugin(plugin));

    let currentReport = input.report;
    let currentReportPath = input.reportPath;

    for (const plugin of plugins) {
        if (!plugin.afterSemanticDiff) {
            continue;
        }

        const startedAt = Date.now();
        const runtimeContext: PluginRuntimeContext = {
            cwd: process.cwd(),
            executionMode: 'analyze-diff',
            emitDiagnostic: diagnostic => {
                if (diagnostic.hook === 'resolveSchemaTypeOverride') {
                    return;
                }
                diagnostics.push({
                    pluginName: plugin.name,
                    hook: diagnostic.hook,
                    status: diagnostic.status,
                    durationMs: 0,
                    message: diagnostic.message,
                });
            },
        };
        try {
            const maybeReport = await plugin.afterSemanticDiff({
                report: currentReport,
                options: {
                    allowBreaking: input.allowBreaking,
                },
            }, runtimeContext);

            if (maybeReport) {
                currentReport = maybeReport;
                const diagnostic: PluginHookDiagnostic = {
                    pluginName: plugin.name,
                    hook: 'afterSemanticDiff',
                    status: 'applied',
                    durationMs: Date.now() - startedAt,
                };
                diagnostics.push(diagnostic);
                input.onDiagnostic?.(diagnostic);
            } else {
                const diagnostic: PluginHookDiagnostic = {
                    pluginName: plugin.name,
                    hook: 'afterSemanticDiff',
                    status: 'skipped',
                    durationMs: Date.now() - startedAt,
                };
                diagnostics.push(diagnostic);
                input.onDiagnostic?.(diagnostic);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const diagnostic: PluginHookDiagnostic = {
                pluginName: plugin.name,
                hook: 'afterSemanticDiff',
                status: 'failed',
                durationMs: Date.now() - startedAt,
                message,
            };
            diagnostics.push(diagnostic);
            input.onDiagnostic?.(diagnostic);

            if (strictPluginMode) {
                throw new Error(`Plugin "${plugin.name}" failed in afterSemanticDiff: ${message}`);
            }
        }
    }

    for (const plugin of plugins) {
        if (!plugin.mapRecommendation) {
            continue;
        }

        const startedAt = Date.now();
        const runtimeContext: PluginRuntimeContext = {
            cwd: process.cwd(),
            executionMode: 'analyze-diff',
            emitDiagnostic: diagnostic => {
                if (diagnostic.hook === 'resolveSchemaTypeOverride') {
                    return;
                }
                diagnostics.push({
                    pluginName: plugin.name,
                    hook: diagnostic.hook,
                    status: diagnostic.status,
                    durationMs: 0,
                    message: diagnostic.message,
                });
            },
        };
        try {
            const maybeRecommendation = await plugin.mapRecommendation({
                recommendation: currentReport.recommendation,
                summary: currentReport.summary,
                governance: currentReport.governance,
            }, runtimeContext);

            if (maybeRecommendation) {
                currentReport = {
                    ...currentReport,
                    recommendation: maybeRecommendation,
                };
                const diagnostic: PluginHookDiagnostic = {
                    pluginName: plugin.name,
                    hook: 'mapRecommendation',
                    status: 'applied',
                    durationMs: Date.now() - startedAt,
                };
                diagnostics.push(diagnostic);
                input.onDiagnostic?.(diagnostic);
            } else {
                const diagnostic: PluginHookDiagnostic = {
                    pluginName: plugin.name,
                    hook: 'mapRecommendation',
                    status: 'skipped',
                    durationMs: Date.now() - startedAt,
                };
                diagnostics.push(diagnostic);
                input.onDiagnostic?.(diagnostic);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const diagnostic: PluginHookDiagnostic = {
                pluginName: plugin.name,
                hook: 'mapRecommendation',
                status: 'failed',
                durationMs: Date.now() - startedAt,
                message,
            };
            diagnostics.push(diagnostic);
            input.onDiagnostic?.(diagnostic);

            if (strictPluginMode) {
                throw new Error(`Plugin "${plugin.name}" failed in mapRecommendation: ${message}`);
            }
        }
    }

    for (const plugin of plugins) {
        if (!plugin.beforeReportWrite) {
            continue;
        }

        const startedAt = Date.now();
        const runtimeContext: PluginRuntimeContext = {
            cwd: process.cwd(),
            executionMode: 'analyze-diff',
            emitDiagnostic: diagnostic => {
                if (diagnostic.hook === 'resolveSchemaTypeOverride') {
                    return;
                }
                diagnostics.push({
                    pluginName: plugin.name,
                    hook: diagnostic.hook,
                    status: diagnostic.status,
                    durationMs: 0,
                    message: diagnostic.message,
                });
            },
        };
        try {
            const maybeResult = await plugin.beforeReportWrite({
                report: currentReport,
                reportPath: currentReportPath,
            }, runtimeContext);

            if (maybeResult?.report) {
                currentReport = maybeResult.report;
            }
            if (maybeResult?.reportPath) {
                currentReportPath = maybeResult.reportPath;
            }

            const diagnostic: PluginHookDiagnostic = {
                pluginName: plugin.name,
                hook: 'beforeReportWrite',
                status: maybeResult ? 'applied' : 'skipped',
                durationMs: Date.now() - startedAt,
            };
            diagnostics.push(diagnostic);
            input.onDiagnostic?.(diagnostic);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const diagnostic: PluginHookDiagnostic = {
                pluginName: plugin.name,
                hook: 'beforeReportWrite',
                status: 'failed',
                durationMs: Date.now() - startedAt,
                message,
            };
            diagnostics.push(diagnostic);
            input.onDiagnostic?.(diagnostic);

            if (strictPluginMode) {
                throw new Error(`Plugin "${plugin.name}" failed in beforeReportWrite: ${message}`);
            }
        }
    }

    return {
        report: currentReport,
        reportPath: currentReportPath,
        diagnostics,
    };
}
