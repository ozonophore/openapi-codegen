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
