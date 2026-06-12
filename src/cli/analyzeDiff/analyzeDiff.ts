import { OptionValues } from 'commander';
import crypto from 'crypto';

import { APP_LOGGER, DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { validateZodOptions } from '../../common/Validation';
import { evaluateGovernanceRules } from '../../core/governance/evaluateGovernanceRules';
import { loadGovernanceConfig } from '../../core/governance/loadGovernanceConfig';
import { applySemanticDiffPluginHooks } from '../../core/plugins/applySemanticDiffPluginHooks';
import { loadGeneratorPlugins } from '../../core/plugins/loadGeneratorPlugins';
import { analyzeOpenApiDiff, SemanticDiffReport, writeSemanticDiffReport } from '../../core/semanticDiff/analyzeOpenApiDiff';
import { UNIFIED_DIFF_REPORT_SCHEMA_VERSION, type UnifiedDiffReport } from '../../core/types/DiffReport.model';
import { adaptSemanticToStructural } from '../../core/utils/adapters';
import { buildMiraclesFromSemanticChanges } from '../../core/utils/buildMiraclesFromSemanticChanges';
import { loadSemanticOpenApiObject, loadSemanticOpenApiSpec } from '../../core/utils/loadSemanticOpenApiSpec';
import { AnalyzeDiffOptions, analyzeDiffOptionsSchema } from '../schemas';
import { formatCiMarkdownSummary } from './ciSummary';
import { loadIgnoreRules } from './ignoreRules';
import { filterSemanticChangesByIgnoreRules } from './ignoreSemanticChanges';
import { resolvePluginPaths } from './pluginPaths';
import { createSemanticDiffContext } from './semanticDiffContext';
import { readSpecFromGit } from './specParser';

/**
 * Результат выполнения команды analyze-diff.
 * @property success признак успешного завершения
 * @property [skipped] анализ пропущен из-за отсутствия базовой спецификации
 * @property [reportPath] абсолютный путь к сохранённому отчёту
 * @property [ignored] количество проигнорированных изменений
 * @property [error] текст ошибки при неуспешном завершении
 */
export type AnalyzeDiffResult = {
    success: boolean;
    skipped?: boolean;
    reportPath?: string;
    ignored?: number;
    error?: string;
};

/**
 * Преобразует результат analyze-diff в код выхода процесса. Не вызывает `process.exit`.
 * @param result результат выполнения analyze-diff
 * @returns код выхода: 0 при успехе, 1 при ошибке
 */
export function toAnalyzeDiffExitCode(result: AnalyzeDiffResult): number {
    return result.success ? 0 : 1;
}

function createSpecHash(spec: unknown): string {
    const seen = new WeakSet<object>();
    const serializedSpec = JSON.stringify(spec, (_key, value) => {
        if (value && typeof value === 'object') {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }

        return value;
    });

    return crypto
        .createHash('sha256')
        .update(serializedSpec ?? '')
        .digest('hex');
}

/**
 * Выполняет семантическое сравнение двух OpenAPI-спецификаций и записывает JSON-отчёт.
 * @param options опции CLI команды analyze-diff
 * @returns результат выполнения с путём к отчёту или описанием ошибки
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

        createSemanticDiffContext(newSpecInput);
        const newSpec = await loadSemanticOpenApiSpec(newSpecInput);
        const oldSpec = oldSpecInput ? await loadSemanticOpenApiSpec(oldSpecInput) : await loadSemanticOpenApiObject(await readSpecFromGit(gitRef as string, newSpecInput), newSpecInput);

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
        const semanticReport: SemanticDiffReport = {
            ...reportAfterIgnore,
            governance: evaluateGovernanceRules({
                openApi: newSpec,
                breakingChangesCount: reportAfterIgnore.summary.breaking,
                allowBreaking: validatedOptions.allowBreaking ?? false,
                governanceConfig: governancePolicy,
            }),
            miracles: buildMiraclesFromSemanticChanges(reportAfterIgnore.changes),
        };
        const report: UnifiedDiffReport = {
            schemaVersion: UNIFIED_DIFF_REPORT_SCHEMA_VERSION,
            timestamp: new Date().toISOString(),
            metadata: {
                base: baseSourceLabel,
                target: newSpecInput,
                baseHash: createSpecHash(oldSpec),
                targetHash: createSpecHash(newSpec),
            },
            semantic: {
                changes: semanticReport.changes,
                governance: semanticReport.governance,
                recommendation: semanticReport.recommendation,
                summary: semanticReport.summary,
            },
            structural: adaptSemanticToStructural(semanticReport, ignored),
        };

        const reportPath = await writeSemanticDiffReport(report, pluginHooksResult.reportPath);

        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.REPORT_CREATED(reportPath));
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.SUMMARY(semanticReport, reportPath));
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.RECOMMENDATION(semanticReport));
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.GOVERNANCE(semanticReport));
        if (ignored > 0) {
            APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.IGNORED_CHANGES(ignored));
        }
        if (validatedOptions.ci) {
            APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.CI_MARKDOWN_SUMMARY(formatCiMarkdownSummary(report, reportPath)));
        }

        if (validatedOptions.ci && semanticReport.governance.summary.errors > 0) {
            return { success: false, reportPath, error: LOGGER_MESSAGES.ANALYZE_DIFF.CI_FAILURE };
        }

        return { success: true, reportPath, ignored };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.error(LOGGER_MESSAGES.ANALYZE_DIFF.EXECUTION_ERROR(message));
        return { success: false, error: message };
    }
}
