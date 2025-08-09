import { GROUP_PRIORITY_SIMPLE } from '../types/Consts';
import type { OperationParameter } from '../types/shared/OperationParameter.model';
import { getPropertyGroupSimple } from './getPropertyGroupSimple';

export function sortByRequiredSimple(a: OperationParameter, b: OperationParameter): number {
    const groupA = getPropertyGroupSimple(a);
    const groupB = getPropertyGroupSimple(b);

    return GROUP_PRIORITY_SIMPLE[groupA] - GROUP_PRIORITY_SIMPLE[groupB];
}
