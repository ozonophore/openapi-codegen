import { TPropertyGroupSimple } from '../types/Models';

// Auxiliary function for defining a property group
export function getPropertyGroupSimple(prop: any): TPropertyGroupSimple {
    return prop.isRequired && prop.default === undefined 
      ? 'requires-value' 
      : 'other';
}
