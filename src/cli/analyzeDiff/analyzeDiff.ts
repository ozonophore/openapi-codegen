import { OptionValues } from 'commander';

import { APP_LOGGER, DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { evaluateGovernanceRules } from '../../core/governance/evaluateGovernanceRules';
import { loadGovernanceConfig } from '../../core/governance/loadGovernanceConfig';
import { applySemanticDiffPluginHooks } from '../../core/plugins/applySemanticDiffPluginHooks';
import { loadGeneratorPlugins } from '../../core/plugins/loadGeneratorPlugins';
import { analyzeOpenApiDiff, SemanticDiffReport, writeSemanticDiffReport } from '../../core/semanticDiff/analyzeOpenApiDiff';
import { CommonOpenApi } from '../../core/types/shared/CommonOpenApi.model';
import { getOpenApiSpec } from '../../core/utils/getOpenApiSpec';
import { AnalyzeDiffOptions, analyzeDiffOptionsSchema } from '../schemas';
import { formatCiMarkdownSummary } from './ciSummary';
import { loadIgnoreRules } from './ignoreRules';
import { filterSemanticChangesByIgnoreRules } from './ignoreSemanticChanges';
import { resolvePluginPaths } from './pluginPaths';
import { createSemanticDiffContext } from './semanticDiffContext';
import { readSpecFromGit } from './specParser';

type AnalyzeDiffResult = {
    success: boolean;
    skipped?: boolean;
    reportPath?: string;
    ignored?: number;
    error?: string;
};

/**
 * Runs semantic diff analysis between two OpenAPI specs and writes JSON report.
 */
export async function analyzeDiff(options: OptionValues): Promise<AnalyzeDiffResult> {
    const validationResult = validateZodOptions(analyzeDiffOptionsSchema, options);

    if (!validationResult.success) {
        const message = validationResult.errors.join('\n');
        APP_LOGGER.error(LOGGER_MESSAGES.ANALYZE_DIFF.VALIDATION_ERROR(message));
        return { success: false, error: message };
    }

    try {
        const validatedOptions = validationResult.data as AnalyzeDiffOptions;
        const reportPathInput = validatedOptions.outputReport ?? DEFAULT_ANALYZE_DIFF_REPORT_PATH;
        const newSpecInput = validatedOptions.input as string;
        const oldSpecInput = validatedOptions.compareWith;
        const gitRef = validatedOptions.git;

        if (!oldSpecInput && !gitRef) {
            APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.SKIPPED_NO_BASE);
            return { success: true, skipped: true };
        }

        const baseSourceLabel = oldSpecInput ? `compare-with:${oldSpecInput}` : `git:${gitRef}`;
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.STARTED(newSpecInput, baseSourceLabel));

        const newContext = createSemanticDiffContext(newSpecInput);
        const newSpec = await getOpenApiSpec(newContext, newSpecInput);
        const oldSpec: CommonOpenApi = oldSpecInput
            ? await getOpenApiSpec(createSemanticDiffContext(oldSpecInput), oldSpecInput)
            : (await readSpecFromGit(gitRef as string, newSpecInput)) as CommonOpenApi;

        if (oldSpecInput && validatedOptions.git) {
            APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.COMPARE_WITH_OVERRIDES_GIT(validatedOptions.git));
        }

        const governancePolicy = await loadGovernanceConfig(validatedOptions.governanceConfig);
        const ignoreRules = loadIgnoreRules(validatedOptions.openapiConfig);
        const plugins = await loadGeneratorPlugins(resolvePluginPaths(validatedOptions.openapiConfig));

        const baseReport = analyzeOpenApiDiff(oldSpec, newSpec, {
            allowBreaking: validatedOptions.allowBreaking ?? false,
            governanceConfig: governancePolicy,
        });
        const pluginHooksResult = await applySemanticDiffPluginHooks({
            report: baseReport,
            reportPath: reportPathInput,
            plugins,
            allowBreaking: validatedOptions.allowBreaking ?? false,
            strictPluginMode: validatedOptions.strictPluginMode ?? false,
            onDiagnostic: diagnostic => {
                APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.PLUGIN_DIAGNOSTIC(diagnostic));
            },
        });

        const { report: reportAfterIgnore, ignored } = filterSemanticChangesByIgnoreRules(pluginHooksResult.report, ignoreRules);
        const report: SemanticDiffReport = {
            ...reportAfterIgnore,
            governance: evaluateGovernanceRules({
                openApi: newSpec,
                breakingChangesCount: reportAfterIgnore.summary.breaking,
                allowBreaking: validatedOptions.allowBreaking ?? false,
                governanceConfig: governancePolicy,
            }),
        };

        const reportPath = await writeSemanticDiffReport(report, pluginHooksResult.reportPath);

        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.REPORT_CREATED(reportPath));
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.SUMMARY(report, reportPath));
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.RECOMMENDATION(report));
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.GOVERNANCE(report));
        if (ignored > 0) {
            APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.IGNORED_CHANGES(ignored));
        }
        if (validatedOptions.ci) {
            APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.CI_MARKDOWN_SUMMARY(formatCiMarkdownSummary(report, reportPath)));
        }

        if (validatedOptions.ci && report.governance.summary.errors > 0) {
            return { success: false, reportPath, error: LOGGER_MESSAGES.ANALYZE_DIFF.CI_FAILURE };
        }

        return { success: true, reportPath, ignored };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.error(LOGGER_MESSAGES.ANALYZE_DIFF.EXECUTION_ERROR(message));
        return { success: false, error: message };
    }
}
