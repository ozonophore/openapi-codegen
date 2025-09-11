import { TypeRef } from "../enums/TypeRef.enum";

/**
 * Ref With type
 * @prop value Value
 * @prop type The type of object passed via ref
 */
export type RefWithType = {
    value: string;
    type: TypeRef;
}