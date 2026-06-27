import type { MiracleEntry } from '../types/shared/Miracle.model';

function formatMiracleSymbol(miracle: MiracleEntry): string {
    if (miracle.modelName && miracle.oldProperty && miracle.newProperty) {
        return `${miracle.modelName}.${miracle.oldProperty} → ${miracle.modelName}.${miracle.newProperty}`;
    }

    const oldSegment = miracle.oldPath.split('/').filter(Boolean).pop() ?? miracle.oldPath;
    const newSegment = miracle.newPath.split('/').filter(Boolean).pop() ?? miracle.newPath;
    return `${oldSegment} → ${newSegment}`;
}

/**
 * Форматирует RENAME miracles для секции migration guide.
 */
export function formatRenameMiraclesForGuide(miracles: MiracleEntry[]): string {
    if (miracles.length === 0) {
        return '';
    }

    let section = '## Symbol Renames (from analyze-diff)\n\n';
    section += 'The diff report suggests these renames. Update consumer imports and property access before cutover:\n\n';

    for (const miracle of miracles) {
        const symbol = formatMiracleSymbol(miracle);
        const confidence = Math.round(miracle.confidence * 100);
        section += `- **${symbol}** (confidence: ${confidence}%)\n`;
        section += `  - Old path: \`${miracle.oldPath}\`\n`;
        section += `  - New path: \`${miracle.newPath}\`\n`;
    }

    section += '\nValidate consumer updates with:\n\n';
    section += '```bash\n';
    section += 'openapi analyze-usage --sourcePath <generated-entry> --projectPath . --diff-report <diff-report.json> --check\n';
    section += '```\n\n';

    return section;
}
