import type { UnifiedDiffReport } from '../../core/types/DiffReport.model';

/**
 * Формирует markdown-сводку семантического diff для CI-логов.
 * @param report унифицированный diff-отчёт
 * @param reportPath путь к сохранённому отчёту
 * @returns markdown-текст для вывода в CI
 */
export function formatCiMarkdownSummary(report: UnifiedDiffReport, reportPath: string): string {
    const semantic = report.semantic;
    const reasons = semantic.recommendation.reasons.map(reason => `- \`${reason}\``).join('\n');

    return [
        '### OpenAPI Semantic Diff',
        `- Report: \`${reportPath}\``,
        `- Schema Version: \`${report.schemaVersion}\``,
        `- Recommendation: \`${semantic.recommendation.semver}\` (confidence: \`${semantic.recommendation.confidence}\`)`,
        `- Reason: ${semantic.recommendation.reason}`,
        '- Reason Codes:',
        reasons,
        `- Summary: breaking=\`${semantic.summary.breaking}\`, nonBreaking=\`${semantic.summary.nonBreaking}\`, informational=\`${semantic.summary.informational}\``,
        `- Governance: errors=\`${semantic.governance.summary.errors}\`, warnings=\`${semantic.governance.summary.warnings}\`, info=\`${semantic.governance.summary.info}\``,
    ].join('\n');
}
