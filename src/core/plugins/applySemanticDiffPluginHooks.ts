import { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';
import { OpenApiGeneratorPlugin, PluginRuntimeContext } from './GeneratorPlugin.model';
import { wrapLegacyPlugin } from './wrapLegacyPlugin';

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

function createAnalyzeDiffRuntime(plugin: OpenApiGeneratorPlugin, input: ApplySemanticDiffPluginHooksInput, diagnostics: PluginHookDiagnostic[]): PluginRuntimeContext {
    return {
        cwd: process.cwd(),
        executionMode: 'analyze-diff',
        emitDiagnostic: diagnostic => {
            if (diagnostic.hook === 'resolveSchemaTypeOverride') {
                return;
            }
            const item: PluginHookDiagnostic = {
                pluginName: plugin.name,
                hook: diagnostic.hook,
                status: diagnostic.status,
                durationMs: 0,
                message: diagnostic.message,
            };
            diagnostics.push(item);
            input.onDiagnostic?.(item);
        },
    };
}

/**
 * Safely applies semantic diff plugin hooks in deterministic order.
 */
export async function applySemanticDiffPluginHooks(input: ApplySemanticDiffPluginHooksInput): Promise<ApplySemanticDiffPluginHooksResult> {
    const diagnostics: PluginHookDiagnostic[] = [];
    const strictPluginMode = input.strictPluginMode ?? false;
    const plugins = input.plugins.map(wrapLegacyPlugin);

    let currentReport = input.report;
    let currentReportPath = input.reportPath;

    for (const plugin of plugins) {
        if (!plugin.afterSemanticDiff) {
            continue;
        }

        const startedAt = Date.now();
        try {
            const maybeReport = await plugin.afterSemanticDiff(
                {
                    report: currentReport,
                    options: {
                        allowBreaking: input.allowBreaking,
                    },
                },
                createAnalyzeDiffRuntime(plugin, input, diagnostics)
            );

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
        try {
            const maybeRecommendation = await plugin.mapRecommendation(
                {
                    recommendation: currentReport.recommendation,
                    summary: currentReport.summary,
                    governance: currentReport.governance,
                },
                createAnalyzeDiffRuntime(plugin, input, diagnostics)
            );

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
        try {
            const maybeResult = await plugin.beforeReportWrite(
                {
                    report: currentReport,
                    reportPath: currentReportPath,
                },
                createAnalyzeDiffRuntime(plugin, input, diagnostics)
            );

            const previousReport = currentReport;
            const previousReportPath = currentReportPath;
            if (maybeResult?.report) {
                currentReport = maybeResult.report;
            }
            if (maybeResult?.reportPath) {
                currentReportPath = maybeResult.reportPath;
            }

            const didChange = currentReport !== previousReport || currentReportPath !== previousReportPath;

            const diagnostic: PluginHookDiagnostic = {
                pluginName: plugin.name,
                hook: 'beforeReportWrite',
                status: didChange ? 'applied' : 'skipped',
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
