import { GROUP_PRIORITY_EXTENDED } from '../types/Consts';
import { OperationParameter } from '../types/shared/OperationParameter.model';
import { getPropertyGroupExtended } from './getPropertyGroupExtended';

export function sortByRequiredExtended(a: OperationParameter, b: OperationParameter): number {
    const groupA = getPropertyGroupExtended(a);
    const groupB = getPropertyGroupExtended(b);

    // If the groups are different, we sort them by priority.
    if (groupA !== groupB) {
        return GROUP_PRIORITY_EXTENDED[groupA] - GROUP_PRIORITY_EXTENDED[groupB];
    }

    // If the groups are the same, we sort them by name.
    return a.name.localeCompare(b.name);
}
