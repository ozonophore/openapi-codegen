import { PropertyGroupSimple } from '../types/base/PropertyGroup.model';

// Auxiliary function for defining a property group
export function getPropertyGroupSimple(prop: any): PropertyGroupSimple {
    return prop.isRequired && prop.default === undefined 
      ? 'requires-value' 
      : 'other';
}
