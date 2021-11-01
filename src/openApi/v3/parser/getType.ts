import type { Type } from '../../../client/interfaces/Type';
import { replaceString } from '../../../core/replaceString';
import { encode } from '../../../utils/encode';
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
 * Parse any string value into a type object.
 * @param value String value like "integer" or "Link[Model]".
 * @param template Optional template class from parent (needed to process generics)
 */
export function getType(value?: string, template?: string): Type {
    const normalizedValue = replaceString(value);

    const result: Type = {
        type: 'any',
        base: 'any',
        template: null,
        imports: [],
        path: '',
    };

    const valueClean = stripNamespace(normalizedValue || '');
    if (/\[.*\]$/g.test(valueClean)) {
        const matches = valueClean.match(/(.*?)\[(.*)\]$/);
        if (matches?.length) {
            const match1 = getType(matches[1]);
            result.path = match1.path;
            const match2 = getType(matches[2]);

            if (match1.type === 'any[]') {
                result.type = `${match2.type}[]`;
                result.base = `${match2.type}`;
                match1.imports = [];
            } else if (match2.type) {
                result.type = `${match1.type}<${match2.type}>`;
                result.base = match1.type;
                result.template = match2.type;
            } else {
                result.type = match1.type;
                result.base = match1.type;
                result.template = match1.type;
            }

            result.imports.push(...match1.imports);
            result.imports.push(...match2.imports);
        }
    } else if (hasMappedType(valueClean)) {
        const mapped = getMappedType(valueClean);
        result.path = valueClean;
        if (mapped) {
            result.type = mapped;
            result.base = mapped;
        }
    } else if (valueClean) {
        const type = getTypeName(valueClean);
        result.path = valueClean;
        result.type = type;
        result.base = type;
        result.imports.push({ name: type, alias: '', path: valueClean });
    }
    // If the property that we found matched the parent template class
    // Then ignore this whole property and return it as a "T" template property.
    if (result.type === template) {
        result.type = 'T'; // Template;
        result.base = 'T'; // Template;
        result.imports = [];
    }
    return result;
}
