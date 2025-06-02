import type { OperationParameter } from '../client/interfaces/OperationParameter';
import { GROUP_PRIORITY } from '../types/Models';
import { getPropertyGroup } from './getPropertyGroup';

export function sortByRequired(a: OperationParameter, b: OperationParameter) {
    // Defining a group for each property
    const groupA = getPropertyGroup(a);
    const groupB = getPropertyGroup(b);

    // We compare them by numerical priorities
    return GROUP_PRIORITY[groupA] - GROUP_PRIORITY[groupB];
}
