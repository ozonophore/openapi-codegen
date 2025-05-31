import type { OperationParameter } from '../types/shared/OperationParameter.model';

export function sortByRequired(a: OperationParameter, b: OperationParameter): number {
    if (!a.isRequired && b.isRequired) {
        return 1;
    }
    if (a.isRequired && !b.isRequired) {
        return -1;
    }
    if ((a.isRequired && a.default === undefined && b.default !== undefined) || (a.isRequired && a.default !== undefined && b.default === undefined)) {
        return -1;
    }
    if ((a.isRequired && a.default !== undefined && b.default === undefined) || (!a.isRequired && a.default === undefined && b.default !== undefined)) {
        return 1;
    }
    return 0;
}
