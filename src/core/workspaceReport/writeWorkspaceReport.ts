import { dirname } from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { WorkspaceReport, WorkspaceReportConfig } from './types';

function buildMarkdown(report: WorkspaceReport): string {
    const lines: string[] = [
        '# Workspace Report',
        '',
        `Generated at: ${report.generatedAt}`,
        '',
        '## Summary',
        '',
        `- Total specs: ${report.summary.totalSpecs}`,
        `- Total duration: ${report.summary.totalDurationMs}ms`,
        `- Reuse hits: ${report.summary.totalReuseHits}`,
        `- Reuse misses: ${report.summary.totalReuseMisses}`,
        `- Shared models: ${report.summary.totalSharedModels}`,
        '',
        '## Specs',
        '',
    ];

    for (const spec of report.specs) {
        lines.push(`### ${spec.name}`);
        lines.push('');
        lines.push(`- Input: \`${spec.input}\``);
        lines.push(`- Duration: ${spec.durationMs}ms`);
        lines.push(`- Reuse hits: ${spec.reuseHits}`);
        lines.push(`- Reuse misses: ${spec.reuseMisses}`);
        lines.push('');
    }

    if (report.crossSpec && report.crossSpec.totalShared > 0) {
        lines.push('## Shared Models (cross-spec)');
        lines.push('');
        for (const artifact of report.crossSpec.sharedArtifacts) {
            lines.push(`- **${artifact.name}** (${artifact.kind}): ${artifact.specItems.join(', ')}`);
        }
        lines.push('');
    }

    return lines.join('\n');
}

export async function writeWorkspaceReport(report: WorkspaceReport, config: WorkspaceReportConfig): Promise<void> {
    const basePath = resolveHelper(process.cwd(), config.path ?? './workspace-report');
    const format = config.format ?? 'json';

    await fileSystemHelpers.mkdir(dirname(basePath));

    if (format === 'json' || format === 'both') {
        await fileSystemHelpers.writeFile(`${basePath}.json`, JSON.stringify(report, null, 2));
    }

    if (format === 'markdown' || format === 'both') {
        await fileSystemHelpers.writeFile(`${basePath}.md`, buildMarkdown(report));
    }
}
