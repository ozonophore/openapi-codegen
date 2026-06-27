import type { SemanticDiffChange } from '../semanticDiff/analyzeOpenApiDiff';
import type { DiffReport, DiffReportEntry } from '../types/DiffReport.model';

function entryToSemanticChange(entry: DiffReportEntry): SemanticDiffChange {
    const categoryPrefix = entry.path.includes('schemas') ? 'model' : entry.path.includes('paths') ? 'operation' : 'spec';

    return {
        type: entry.type ?? `${categoryPrefix}.${entry.action}`,
        severity: 'breaking',
        path: entry.path,
        message: entry.note ?? `${entry.action} at ${entry.path}`,
        from: entry.from,
        to: entry.to,
    };
}

/**
 * Извлекает breaking-изменения из legacy diff-отчёта, загруженного через loadDiffReport.
 */
export function extractBreakingChangesFromDiffReport(report: DiffReport): SemanticDiffChange[] {
    const breakingEntries = report.diff?.breaking?.length ? report.diff.breaking : (report.diff?.all ?? []).filter(entry => entry.severity === 'breaking');

    return breakingEntries.map(entryToSemanticChange);
}

/**
 * Группирует breaking-изменения по категории (первый сегмент type: model, operation, spec).
 */
export function extractBreakingChangeCategories(changes: SemanticDiffChange[]): Record<string, number> {
    const categories: Record<string, number> = {};

    for (const change of changes) {
        const category = change.type.split('.')[0] || 'other';
        categories[category] = (categories[category] ?? 0) + 1;
    }

    return categories;
}
