import { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';
import { OpenApiGeneratorPlugin } from './GeneratorPlugin.model';

export type PluginHookName = 'afterSemanticDiff' | 'mapRecommendation' | 'beforeReportWrite';

export type PluginHookDiagnostic = {
    pluginName: string;
    hook: PluginHookName;
    status: 'applied' | 'skipped' | 'failed';
    durationMs: number;
    message?: string;
};

export type ApplySemanticDiffPluginHooksInput = {
    report: SemanticDiffReport;
    reportPath: string;
    plugins: OpenApiGeneratorPlugin[];
    allowBreaking: boolean;
    strictPluginMode?: boolean;
    onDiagnostic?: (diagnostic: PluginHookDiagnostic) => void;
};

export type ApplySemanticDiffPluginHooksResult = {
    report: SemanticDiffReport;
    reportPath: string;
    diagnostics: PluginHookDiagnostic[];
};

/**
 * Safely applies semantic diff plugin hooks in deterministic order.
 */
export async function applySemanticDiffPluginHooks(
    input: ApplySemanticDiffPluginHooksInput
): Promise<ApplySemanticDiffPluginHooksResult> {
    const diagnostics: PluginHookDiagnostic[] = [];
    const strictPluginMode = input.strictPluginMode ?? false;

    let currentReport = input.report;
    let currentReportPath = input.reportPath;

    for (const plugin of input.plugins) {
        if (!plugin.afterSemanticDiff) {
            continue;
        }

        const startedAt = Date.now();
        try {
            const maybeReport = await plugin.afterSemanticDiff({
                report: currentReport,
                options: {
                    allowBreaking: input.allowBreaking,
                },
            });

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

    for (const plugin of input.plugins) {
        if (!plugin.mapRecommendation) {
            continue;
        }

        const startedAt = Date.now();
        try {
            const maybeRecommendation = await plugin.mapRecommendation({
                recommendation: currentReport.recommendation,
                summary: currentReport.summary,
                governance: currentReport.governance,
            });

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

    for (const plugin of input.plugins) {
        if (!plugin.beforeReportWrite) {
            continue;
        }

        const startedAt = Date.now();
        try {
            const maybeResult = await plugin.beforeReportWrite({
                report: currentReport,
                reportPath: currentReportPath,
            });

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
