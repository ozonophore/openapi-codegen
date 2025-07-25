import type { Type } from '../../../types/shared/Type.model';
import { getAbsolutePath } from '../../../utils/getAbsolutePath';
import { getMappedType, hasMappedType } from '../../../utils/getMappedType';
import { getRelativeModelImportPath } from '../../../utils/getRelativeModelImportPath';
import { getRelativeModelPath } from '../../../utils/getRelativeModelPath';
import { getTypeName } from '../../../utils/getTypeName';
import { replaceString } from '../../../utils/replaceString';
import { stripNamespace } from '../../../utils/stripNamespace';
import { Parser } from '../Parser';

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
    const valuePath = getRelativeModelPath(this.context.output?.outputModels, valueClean);
    if (hasMappedType(valueClean)) {
        const mapped = getMappedType(valueClean);
        result.path = valuePath;
        if (mapped) {
            result.type = mapped;
            result.base = mapped;
        }
    } else if (valueClean) {
        const valueImportPath = getRelativeModelImportPath(this.context.output.outputModels, parentRef, valueClean);
        const type = this.getTypeNameByRef(getTypeName(valueClean), getAbsolutePath(value, parentRef));
        result.path = valuePath;
        result.type = type;
        result.base = type;
        result.imports.push({ name: type, alias: '', path: valueImportPath });
    }

    return result;
}
