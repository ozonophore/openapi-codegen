import type { Type } from '../../../types/shared/Type.model';
import { getMappedType, hasMappedType } from '../../../utils/getMappedType';
import { getTypeName } from '../../../utils/getTypeName';
import { normalizeString } from '../../../utils/normalizeString';
import { resolveRefToImportPath } from '../../../utils/resolveRefToImportPath';
import { stripNamespace } from '../../../utils/stripNamespace';
import { Parser } from '../Parser';

/**
 * Parse any string value into a type object.
 * @param value String value like "integer" or "Link[Model]".
 * @param parentRef Reference to a parent model
 */
export function getType(this: Parser, value: string, parentRef: string): Type {
    const normalizedValue = normalizeString(value) || '';

    const result: Type = {
        type: 'any',
        base: 'any',
        template: null,
        imports: [],
        path: '',
    };

    const valueClean = stripNamespace(normalizedValue);
    if (hasMappedType(valueClean)) {
        const mapped = getMappedType(valueClean);
        result.path = valueClean;
        if (mapped) {
            result.type = mapped;
            result.base = mapped;
        }
    } else if (valueClean) {
        // Safely calculate the path that the specification file will have in outputModels folder
        const valuePath = resolveRefToImportPath({
            mainSpecPath: this.context.root?.path || '',
            parentFilePath: parentRef,
            refValuePath: normalizedValue,
            outputModelsPath: this.context.output?.outputModels,
        });
        const type = this.getTypeNameByRef(getTypeName(valueClean), parentRef);
        const valueImportPath = !valuePath.startsWith('./') ? `./${valuePath}` : valuePath;
        result.path = valuePath;
        result.type = type;
        result.base = type;
        result.imports.push({ name: type, alias: '', path: valueImportPath });
    }

    return result;
}
