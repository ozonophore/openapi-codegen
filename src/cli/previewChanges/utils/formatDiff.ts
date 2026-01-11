import * as diff from 'diff';

/**
 * Форматирует diff для сохранения в файл
 */
export function formatDiff(filePath: string, fileDiff: diff.Change[]): string {
    const lines: string[] = [`File: ${filePath}`, '='.repeat(80), ''];

    fileDiff.forEach(part => {
        const prefix = part.added ? '+' : part.removed ? '-' : ' ';
        const lines_ = part.value.split('\n');
        lines_.forEach(line => {
            if (line || lines_.length > 1) {
                lines.push(`${prefix} ${line}`);
            }
        });
    });

    return lines.join('\n');
}
