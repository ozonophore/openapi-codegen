import { TypeRef } from './Enums';

/**
 * Ref With type
 * @prop value Value
 * @prop type The type of object passed via ref
 */
export interface IRefWithtype {
    value: string;
    type: TypeRef;
}

// Priority map for property groups
export const GROUP_PRIORITY = {
    required: 0, // Highest Priority
    'required-with-default': 1,
    optional: 2,
    'optional-with-default': 3, // Lowest priority
};
