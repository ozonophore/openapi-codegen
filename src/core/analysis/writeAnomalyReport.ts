import * as path from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { AnomalyDetectionConfig, AnomalyReport } from './types';

const DEFAULT_REPORT_PATHS: Record<NonNullable<AnomalyDetectionConfig['reportFormat']>, string> = {
    json: './anomaly-report.json',
    markdown: './anomaly-report.md',
    html: './anomaly-report.html',
};

function formatAnomalyReportMarkdown(report: AnomalyReport): string {
    const lines = [
        '# Anomaly Detection Report',
        '',
        `- **Generated:** ${report.timestamp}`,
        `- **Spec version:** ${report.specVersion}`,
        `- **Total anomalies:** ${report.totalAnomalies}`,
        `- **Critical anomalies:** ${report.criticalAnomalies}`,
        '',
        '## Summary',
        '',
        `- Estimated performance gain: ${report.summary.estimatedPerformanceGain}`,
        `- Bundle size impact: ${report.summary.bundleSizeImpact}`,
        `- Implementation effort: ${report.summary.implementationEffort}`,
        '',
    ];

    if (report.anomalies.length > 0) {
        lines.push('## Anomalies', '');
        for (const anomaly of report.anomalies) {
            lines.push(`### ${anomaly.type} (${anomaly.severity})`, '', anomaly.description, '');
            if (anomaly.affectedPaths?.length) {
                lines.push('**Affected paths:**', ...anomaly.affectedPaths.map(p => `- ${p}`), '');
            }
            if (anomaly.suggestedAction) {
                lines.push(`**Suggested action:** ${anomaly.suggestedAction}`, '');
            }
        }
    }

    if (report.recommendations.length > 0) {
        lines.push('## Recommendations', '');
        for (const rec of report.recommendations) {
            lines.push(`- **${rec.title}** (${rec.priority}): ${rec.description}`);
        }
    }

    return `${lines.join('\n')}\n`;
}

function formatAnomalyReportHtml(report: AnomalyReport): string {
    const anomalyRows = report.anomalies
        .map(
            anomaly => `
        <tr>
            <td>${escapeHtml(anomaly.type)}</td>
            <td>${escapeHtml(anomaly.severity)}</td>
            <td>${escapeHtml(anomaly.description)}</td>
        </tr>`
        )
        .join('');

    const recommendationItems = report.recommendations.map(rec => `<li><strong>${escapeHtml(rec.title)}</strong> (${escapeHtml(rec.priority)}): ${escapeHtml(rec.description)}</li>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Anomaly Detection Report</title>
    <style>
        body { font-family: sans-serif; margin: 2rem; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>Anomaly Detection Report</h1>
    <p><strong>Generated:</strong> ${escapeHtml(report.timestamp)}</p>
    <p><strong>Spec version:</strong> ${escapeHtml(report.specVersion)}</p>
    <p><strong>Total anomalies:</strong> ${report.totalAnomalies}</p>
    <p><strong>Critical anomalies:</strong> ${report.criticalAnomalies}</p>
    <h2>Summary</h2>
    <ul>
        <li>Estimated performance gain: ${escapeHtml(report.summary.estimatedPerformanceGain)}</li>
        <li>Bundle size impact: ${escapeHtml(report.summary.bundleSizeImpact)}</li>
        <li>Implementation effort: ${escapeHtml(report.summary.implementationEffort)}</li>
    </ul>
    <h2>Anomalies</h2>
    <table>
        <thead>
            <tr><th>Type</th><th>Severity</th><th>Description</th></tr>
        </thead>
        <tbody>${anomalyRows || '<tr><td colspan="3">No anomalies detected</td></tr>'}</tbody>
    </table>
    <h2>Recommendations</h2>
    <ul>${recommendationItems || '<li>No recommendations</li>'}</ul>
</body>
</html>
`;
}

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function resolveReportPath(config: AnomalyDetectionConfig): string {
    const reportFormat = config.reportFormat ?? 'json';
    return config.reportPath ?? DEFAULT_REPORT_PATHS[reportFormat];
}

async function serializeReport(report: AnomalyReport, reportFormat: NonNullable<AnomalyDetectionConfig['reportFormat']>): Promise<string> {
    switch (reportFormat) {
        case 'markdown':
            return formatAnomalyReportMarkdown(report);
        case 'html':
            return formatAnomalyReportHtml(report);
        case 'json':
        default:
            return format(JSON.stringify(report, null, 2), 'json');
    }
}

/**
 * Записывает отчёт детекции аномалий на диск.
 * @param report отчёт детекции
 * @param config настройки формата и пути отчёта
 * @returns абсолютный путь к записанному файлу
 */
export async function writeAnomalyReport(report: AnomalyReport, config: AnomalyDetectionConfig): Promise<string> {
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
