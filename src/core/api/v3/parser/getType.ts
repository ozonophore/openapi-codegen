import type { Type } from '../../../types/shared/Type.model';
import { getMappedType, hasMappedType } from '../../../utils/getMappedType';
import { getTypeName } from '../../../utils/getTypeName';
import { replaceString } from '../../../utils/replaceString';
import { resolveRefToImportPath } from '../../../utils/resolveRefToImportPath';
import { stripNamespace } from '../../../utils/stripNamespace';
import { Parser } from '../Parser';

/**
 * Parse any string value into a type object.
 * @param value String value like "integer" or "Link[Model]".
 * @param parentRef Reference to a parent model
 */
export function getType(this: Parser, value: string, parentRef: string): Type {
    const normalizedValue = replaceString(value) || '';

    const result: Type = {
        type: 'any',
        base: 'any',
        imports: [],
        path: '',
        template: null,
    };

    const valueClean = stripNamespace(normalizedValue);
    if (hasMappedType(valueClean)) {
        const mapped = getMappedType(valueClean);
        result.path = valueClean.toLowerCase();
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
        const type = this.getTypeNameByRef(getTypeName(valueClean));
        // Only prefix with "./" when the path is non-empty and does not already
        // start with "/" (absolute) or "." (relative like "./" or "../").
        let valueImportPath = valuePath;
        if (valuePath && !valuePath.startsWith('/') && !valuePath.startsWith('.')) {
            valueImportPath = `./${valuePath}`;
        }
        result.path = valuePath;
        result.type = type;
        result.base = type;
        // Push import only when we actually have a path (avoid './' for empty)
        if (valuePath) {
            result.imports.push({ name: type, alias: '', path: valueImportPath });
        }
    }

    return result;
}
