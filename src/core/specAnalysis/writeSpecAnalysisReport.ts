import * as path from 'path';

import { buildDefaultReportPath } from '../../common/Consts';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { SpecAnalysisConfig } from '../analysis/types';
import type { SpecAnalysisReport } from './types';

const DEFAULT_REPORT_PATHS: Record<NonNullable<SpecAnalysisConfig['reportFormat']>, string> = {
    json: buildDefaultReportPath('anomaly-report.json'),
    markdown: buildDefaultReportPath('anomaly-report.md'),
    html: buildDefaultReportPath('anomaly-report.html'),
};

function formatSpecAnalysisMarkdown(report: SpecAnalysisReport): string {
    const lines = [
        '# Spec Analysis Report',
        '',
        '## Summary',
        '',
        `- High: ${report.summary.high}`,
        `- Medium: ${report.summary.medium}`,
        `- Low: ${report.summary.low}`,
        `- Info: ${report.summary.info}`,
        '',
    ];

    if (report.perSpec.length > 0) {
        lines.push('## Per-spec findings', '');
        for (const finding of report.perSpec) {
            lines.push(`### ${finding.category} (${finding.severity})`, '', finding.description, '');
            if (finding.affectedPaths?.length) {
                lines.push('**Affected paths:**', ...finding.affectedPaths.map(item => `- ${item}`), '');
            }
            if (finding.suggestedAction) {
                lines.push(`**Suggested action:** ${finding.suggestedAction}`, '');
            }
        }
    }

    if (report.crossSpec.length > 0) {
        lines.push('## Cross-spec findings', '');
        for (const finding of report.crossSpec) {
            lines.push(`### ${finding.category} (${finding.severity})`, '', finding.description, '');
        }
    }

    return `${lines.join('\n')}\n`;
}

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatSpecAnalysisHtml(report: SpecAnalysisReport): string {
    const rows = [...report.perSpec, ...report.crossSpec]
        .map(
            finding => `
        <tr>
            <td>${escapeHtml(finding.category)}</td>
            <td>${escapeHtml(finding.severity)}</td>
            <td>${escapeHtml(finding.description)}</td>
        </tr>`
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Spec Analysis Report</title>
    <style>
        body { font-family: sans-serif; margin: 2rem; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>Spec Analysis Report</h1>
    <p>High: ${report.summary.high}, Medium: ${report.summary.medium}, Low: ${report.summary.low}, Info: ${report.summary.info}</p>
    <table>
        <thead>
            <tr><th>Category</th><th>Severity</th><th>Description</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="3">No findings</td></tr>'}</tbody>
    </table>
</body>
</html>
`;
}

function resolveReportPath(config: SpecAnalysisConfig): string {
    const reportFormat = config.reportFormat ?? 'json';
    return config.reportPath ?? DEFAULT_REPORT_PATHS[reportFormat];
}

async function serializeReport(report: SpecAnalysisReport, reportFormat: NonNullable<SpecAnalysisConfig['reportFormat']>): Promise<string> {
    switch (reportFormat) {
        case 'markdown':
            return formatSpecAnalysisMarkdown(report);
        case 'html':
            return formatSpecAnalysisHtml(report);
        case 'json':
        default:
            return format(JSON.stringify(report, null, 2), 'json');
    }
}

export async function writeSpecAnalysisReport(report: SpecAnalysisReport, config: SpecAnalysisConfig): Promise<string> {
    const reportFormat = config.reportFormat ?? 'json';
    const reportFilePath = resolveReportPath(config);
    const resolvedReportPath = resolveHelper(process.cwd(), reportFilePath);
    const reportDir = path.dirname(resolvedReportPath);

    const isReportDirExists = await fileSystemHelpers.exists(reportDir);
    if (!isReportDirExists) {
        await fileSystemHelpers.mkdir(reportDir);
    }

    const reportContent = await serializeReport(report, reportFormat);
    await fileSystemHelpers.writeFile(resolvedReportPath, reportContent);

    return resolvedReportPath;
}
