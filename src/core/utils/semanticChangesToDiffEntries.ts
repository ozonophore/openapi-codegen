import type { SemanticDiffChange } from '../semanticDiff/analyzeOpenApiDiff';
import type { DiffReportEntry } from '../types/DiffReport.model';
import type { DiffAction, DiffSeverity } from '../types/shared/DiffInfo.model';
import { semanticPointerToJsonPath } from './semanticPointerToJsonPath';

const REMOVED_CHANGE_TYPES = new Set(['model.removed', 'model.property.removed', 'model.enum.value.removed', 'operation.removed', 'operation.parameter.removed', 'operation.response.success.removed']);

const ADDED_CHANGE_TYPES = new Set(['model.added', 'model.property.added', 'model.enum.value.added', 'operation.added', 'operation.parameter.added', 'operation.response.success.added']);

const CHANGED_CHANGE_TYPES = new Set([
    'model.property.type.changed',
    'model.property.required.changed',
    'operation.parameter.required.changed',
    'operation.parameter.type.changed',
    'operation.requestBody.required.changed',
    'operation.response.success.type.changed',
]);

/**
 * Преобразует тип семантического изменения в legacy diff action.
 * @param changeType тип семантического изменения
 * @returns действие legacy diff
 */
export function semanticChangeTypeToAction(changeType: string): DiffAction {
    if (REMOVED_CHANGE_TYPES.has(changeType) || changeType.endsWith('.removed')) {
        return 'removed';
    }

    if (ADDED_CHANGE_TYPES.has(changeType) || changeType.endsWith('.added')) {
        return 'added';
    }

    if (CHANGED_CHANGE_TYPES.has(changeType) || changeType.endsWith('.changed')) {
        return 'changed';
    }

    return 'changed';
}

/**
 * Преобразует серьёзность семантического изменения в legacy diff severity.
 * @param severity серьёзность семантического изменения
 * @returns уровень серьёзности legacy diff
 */
export function semanticSeverityToDiffSeverity(severity: SemanticDiffChange['severity']): DiffSeverity {
    if (severity === 'breaking') {
        return 'breaking';
    }

    if (severity === 'non-breaking') {
        return 'warning';
    }

    return 'info';
}

/**
 * Строит legacy JSONPath для семантического изменения, включая суффикс `.type`.
 * @param change семантическое изменение
 * @returns JSONPath для legacy diff
 */
export function semanticChangeToJsonPath(change: SemanticDiffChange): string {
    const basePath = semanticPointerToJsonPath(change.path);

    if (change.type === 'model.property.type.changed' || change.type === 'operation.parameter.type.changed') {
        return `${basePath}.type`;
    }

    return basePath;
}

/**
 * Извлекает значения from/to для legacy diff-записи.
 * @param change семантическое изменение
 * @returns значения до и после изменения
 */
function resolveSemanticChangeValues(change: SemanticDiffChange): { from?: unknown; to?: unknown } {
    if (change.type === 'model.property.required.changed' || change.type === 'operation.parameter.required.changed') {
        return {
            from: change.fromRequired,
            to: change.toRequired,
        };
    }

    if (change.from !== undefined || change.to !== undefined) {
        return {
            from: change.from,
            to: change.to,
        };
    }

    return {};
}

/**
 * Преобразует семантические изменения в legacy DiffReportEntry.
 * @param changes список семантических изменений
 * @returns список legacy diff-записей
 */
export function semanticChangesToDiffEntries(changes: SemanticDiffChange[]): DiffReportEntry[] {
    return changes.map(change => {
        const { from, to } = resolveSemanticChangeValues(change);

        return {
            action: semanticChangeTypeToAction(change.type),
            path: semanticChangeToJsonPath(change),
            severity: semanticSeverityToDiffSeverity(change.severity),
            from,
            to,
            note: change.message,
        };
    });
}
