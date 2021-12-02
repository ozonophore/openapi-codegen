import type { Type } from '../../../client/interfaces/Type';
import { replaceString } from '../../../core/replaceString';
import { encode } from '../../../utils/encode';
import { getAbsolutePath } from '../../../utils/getAbsolutePath';
import { Parser } from '../Parser';
import { getMappedType, hasMappedType } from './getMappedType';
import { stripNamespace } from './stripNamespace';

function getTypeName(value: string): string {
    const index = value.lastIndexOf('/');
    if (index === -1) {
        return encode(value);
    }
    return encode(value.substring(index, value.length));
}

/**
 * Returns type name that depends on ref
 * @param type String - original type name
 * @param ref String - optional reference to object
 */
export type GetTypeName = (type: string, ref?: string) => string;

/**
 * Parse any string value into a type object.
 * @param value String value like "integer" or "Link[Model]".
 * @param parentRef Reference to a parent model
 */
export function getType(this: Parser, value: string, parentRef: string): Type {
    const normalizedValue = replaceString(value);

    const result: Type = {
        type: 'any',
        base: 'any',
        imports: [],
        path: '',
        template: null,
    };

    const valueClean = stripNamespace(normalizedValue || '');
    if (hasMappedType(valueClean)) {
        const mapped = getMappedType(valueClean);
        result.path = valueClean;
        if (mapped) {
            result.type = mapped;
            result.base = mapped;
        }
    } else if (valueClean) {
        const type = this.getTypeNameByRef(getTypeName(valueClean), getAbsolutePath(value, parentRef));
        result.path = valueClean;
        result.type = type;
        result.base = type;
        result.imports.push({ name: type, alias: '', path: valueClean });
    }
    return result;
}
