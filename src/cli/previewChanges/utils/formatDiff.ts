import * as diff from 'diff';

/**
 * Форматирует diff для сохранения в markdown файл
 */
export function formatDiff(
    filePath: string,
    status: 'added' | 'modified' | 'removed',
    fileDiff?: diff.Change[]
): string {
    const lines: string[] = [`# ${filePath}`, '', `**Status:** ${status.toUpperCase()}`, ''];

    if (status === 'added') {
        lines.push('This is a new file.');
    } else if (status === 'removed') {
        lines.push('This file was deleted.');
    } else if (fileDiff) {
        lines.push('## Changes', '');
        lines.push('```diff');

        fileDiff.forEach(part => {
            const prefix = part.added ? '+' : part.removed ? '-' : ' ';
            const lines_ = part.value.split('\n');
            lines_.forEach(line => {
                if (line || lines_.length > 1) {
                    lines.push(`${prefix} ${line}`);
                }
            });
        });

        lines.push('```');
    }

    return lines.join('\n');
}
