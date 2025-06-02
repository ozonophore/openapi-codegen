import { OperationParameter } from '../client/interfaces/OperationParameter';
import { GROUP_PRIORITY } from '../types/Models';

// Auxiliary function for defining a property group
export function getPropertyGroup(prop: OperationParameter): keyof typeof GROUP_PRIORITY {
    if (prop.isRequired) {
        return prop.default === undefined ? 'required' : 'required-with-default';
    }
    return prop.default === undefined ? 'optional' : 'optional-with-default';
}
