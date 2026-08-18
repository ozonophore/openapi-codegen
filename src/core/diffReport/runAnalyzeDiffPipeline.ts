import type { GovernancePolicyConfig } from '../governance/evaluateGovernanceRules';
import type { PluginHookDiagnostic } from '../plugins/applySemanticDiffPluginHooks';
import type { OpenApiGeneratorPlugin } from '../plugins/GeneratorPlugin.model';
import { analyzeOpenApiDiff, type SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import type { UnifiedDiffReport } from './DiffReport.model';
import { enrichSemanticDiffReport } from './enrichSemanticDiffReport';
import type { IgnoreRule } from './ignoreRule.model';
import { produceUnifiedDiffReport } from './produceUnifiedDiffReport';
import { writeDiffReport } from './writeDiffReport';

export type RunAnalyzeDiffPipelineInput = {
    oldSpec: CommonOpenApi;
    newSpec: CommonOpenApi;
    /** Unified metadata base label (e.g. `compare-with:…` or `git:…`). */
    base: string;
    /** Unified metadata target label (usually the input Spec path). */
    target: string;
    reportPath: string;
    plugins: OpenApiGeneratorPlugin[];
    ignoreRules: IgnoreRule[];
    governanceConfig?: GovernancePolicyConfig;
    allowBreaking: boolean;
    /** When true, governance errors set `ciFailed` after the report is written. */
    ci: boolean;
    strictPluginMode?: boolean;
    onDiagnostic?: (diagnostic: PluginHookDiagnostic) => void;
};

export type RunAnalyzeDiffPipelineResult = {
    reportPath: string;
    ignored: number;
    semanticReport: SemanticDiffReport;
    report: UnifiedDiffReport;
    ciFailed: boolean;
};

/**
 * Analyze Diff success-path pipeline: analyze → enrich → produce → write → CI governance gate.
 * Spec/policy loading and INFO logging stay with the caller.
 */
export async function runAnalyzeDiffPipeline(input: RunAnalyzeDiffPipelineInput): Promise<RunAnalyzeDiffPipelineResult> {
    const baseReport = analyzeOpenApiDiff(input.oldSpec, input.newSpec, {
        allowBreaking: input.allowBreaking,
        governanceConfig: input.governanceConfig,
    });

    const {
        report: semanticReport,
        ignored,
        reportPath: enrichedReportPath,
    } = await enrichSemanticDiffReport({
        baseReport,
        openApi: input.newSpec,
        reportPath: input.reportPath,
        plugins: input.plugins,
        ignoreRules: input.ignoreRules,
        governanceConfig: input.governanceConfig,
        allowBreaking: input.allowBreaking,
        strictPluginMode: input.strictPluginMode,
        onDiagnostic: input.onDiagnostic,
    });

    const report = produceUnifiedDiffReport({
        semantic: semanticReport,
        base: input.base,
        target: input.target,
        baseSpec: input.oldSpec,
        targetSpec: input.newSpec,
        ignored,
    });

    const reportPath = await writeDiffReport(report, enrichedReportPath);

    const ciFailed = input.ci && semanticReport.governance.summary.errors > 0;

    return {
        reportPath,
        ignored,
        semanticReport,
        report,
        ciFailed,
    };
}
