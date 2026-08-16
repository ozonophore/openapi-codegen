import { evaluateGovernanceRules, type GovernancePolicyConfig } from '../governance/evaluateGovernanceRules';
import { applySemanticDiffPluginHooks, type PluginHookDiagnostic } from '../plugins/applySemanticDiffPluginHooks';
import type { OpenApiGeneratorPlugin } from '../plugins/GeneratorPlugin.model';
import type { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { buildMiraclesFromSemanticChanges } from './buildMiraclesFromSemanticChanges';
import { filterSemanticChangesByIgnoreRules } from './filterSemanticChangesByIgnoreRules';
import type { IgnoreRule } from './ignoreRule.model';

export type EnrichSemanticDiffReportInput = {
    baseReport: SemanticDiffReport;
    openApi: CommonOpenApi;
    reportPath: string;
    plugins: OpenApiGeneratorPlugin[];
    ignoreRules: IgnoreRule[];
    governanceConfig?: GovernancePolicyConfig;
    allowBreaking: boolean;
    strictPluginMode?: boolean;
    onDiagnostic?: (diagnostic: PluginHookDiagnostic) => void;
};

export type EnrichSemanticDiffReportResult = {
    report: SemanticDiffReport;
    ignored: number;
    reportPath: string;
};

/**
 * Enriches a base semantic DiffReport: plugin hooks → ignore filter → governance + miracles.
 * Does not load Specs, analyze, produce Unified, write, or CI-log.
 */
export async function enrichSemanticDiffReport(input: EnrichSemanticDiffReportInput): Promise<EnrichSemanticDiffReportResult> {
    const pluginHooksResult = await applySemanticDiffPluginHooks({
        report: input.baseReport,
        reportPath: input.reportPath,
        plugins: input.plugins,
        allowBreaking: input.allowBreaking,
        strictPluginMode: input.strictPluginMode,
        onDiagnostic: input.onDiagnostic,
    });

    const { report: reportAfterIgnore, ignored } = filterSemanticChangesByIgnoreRules(pluginHooksResult.report, input.ignoreRules);

    const report: SemanticDiffReport = {
        ...reportAfterIgnore,
        governance: evaluateGovernanceRules({
            openApi: input.openApi,
            breakingChangesCount: reportAfterIgnore.summary.breaking,
            allowBreaking: input.allowBreaking,
            governanceConfig: input.governanceConfig,
        }),
        miracles: buildMiraclesFromSemanticChanges(reportAfterIgnore.changes),
    };

    return {
        report,
        ignored,
        reportPath: pluginHooksResult.reportPath,
    };
}
