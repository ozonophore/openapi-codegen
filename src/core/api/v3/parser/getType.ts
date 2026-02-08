import { relativeHelper } from '../../../../common/utils/pathHelpers';
import type { Type } from '../../../types/shared/Type.model';
import { getMappedType, hasMappedType } from '../../../utils/getMappedType';
import { getTypeName } from '../../../utils/getTypeName';
import { normalizeString } from '../../../utils/normalizeString';
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
        /**
         * canonicalValue может быть пустой строкой.
         * В этом случае надо брать непосредственно normalizedValue - это относительный путь или фрагмент.
         * Предполагаем, что в таком случае расчитывать нет нужды. Это путь от папки outputModels
         */
        const canonicalValue = this.context.resolveCanonicalRef(normalizedValue, parentRef);
        let valuePath = valueClean;

        if (canonicalValue) {
            const refValuePath = canonicalValue?.fragment ? `${canonicalValue.outputFile}${canonicalValue.fragment}` : canonicalValue?.outputFile || '';
            const cleanedRefValuePath = stripNamespace(refValuePath);
            valuePath = relativeHelper(this.context.output?.outputModels, cleanedRefValuePath);
        }

        valuePath = !valuePath.startsWith('./') && !valuePath.startsWith('../') ? `./${valuePath}` : valuePath;

        const type = this.getTypeNameByRef(getTypeName(valueClean), normalizedValue, parentRef);
        const valueImportPath = !valuePath.startsWith('./') ? `./${valuePath}` : valuePath;
        result.path = valuePath;
        result.type = type;
        result.base = type;
        result.imports.push({ name: type, alias: '', path: valueImportPath });
    }

    return result;
}
