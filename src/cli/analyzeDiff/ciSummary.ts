import { SemanticDiffReport } from '../../core/semanticDiff/analyzeOpenApiDiff';

/**
 * Builds markdown summary for CI logs.
 */
export function formatCiMarkdownSummary(report: SemanticDiffReport, reportPath: string): string {
    const reasons = report.recommendation.reasons.map(reason => `- \`${reason}\``).join('\n');

    return [
        '### OpenAPI Semantic Diff',
        `- Report: \`${reportPath}\``,
        `- Schema Version: \`${report.schemaVersion}\``,
        `- Recommendation: \`${report.recommendation.semver}\` (confidence: \`${report.recommendation.confidence}\`)`,
        `- Reason: ${report.recommendation.reason}`,
        '- Reason Codes:',
        reasons,
        `- Summary: breaking=\`${report.summary.breaking}\`, nonBreaking=\`${report.summary.nonBreaking}\`, informational=\`${report.summary.informational}\``,
        `- Governance: errors=\`${report.governance.summary.errors}\`, warnings=\`${report.governance.summary.warnings}\`, info=\`${report.governance.summary.info}\``,
    ].join('\n');
}
