import { PropertyGroupExtended } from '../types/base/PropertyGroup.model';
import { OperationParameter } from '../types/shared/OperationParameter.model';

// Auxiliary function for defining a property group
export function getPropertyGroupExtended(prop: OperationParameter): PropertyGroupExtended {
    if (prop.isRequired) {
        return prop.default === undefined ? 'required' : 'required-with-default';
    }
    return prop.default === undefined ? 'optional' : 'optional-with-default';
}
