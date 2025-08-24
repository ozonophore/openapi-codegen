import type { OperationParameter } from '../../../types/shared/OperationParameter.model';
import { extendEnum } from '../../../utils/extendEnum';
import { getComment } from '../../../utils/getComment';
import { getEnum } from '../../../utils/getEnum';
import { getEnumFromDescription } from '../../../utils/getEnumFromDescription';
import { getOperationParameterName } from '../../../utils/getOperationParameterName';
import { getPattern } from '../../../utils/getPattern';
import { normalizeRef } from '../../../utils/normalizeRef';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiParameter } from '../types/OpenApiParameter.model';
import { getOperationParameterDefault } from './getOperationParameterDefault';

export function getOperationParameter(this: Parser, openApi: OpenApi, parameter: OpenApiParameter, parentRef: string): OperationParameter {
    const operationParameter: OperationParameter = {
        path: '',
        in: parameter.in,
        prop: parameter.name,
        export: 'interface',
        name: getOperationParameterName(parameter.name),
        alias: '',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: getComment(parameter.description),
        isDefinition: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: parameter['x-nullable'] === true,
        format: parameter.format,
        maximum: parameter.maximum,
        exclusiveMaximum: parameter.exclusiveMaximum,
        minimum: parameter.minimum,
        exclusiveMinimum: parameter.exclusiveMinimum,
        multipleOf: parameter.multipleOf,
        maxLength: parameter.maxLength,
        minLength: parameter.minLength,
        maxItems: parameter.maxItems,
        minItems: parameter.minItems,
        uniqueItems: parameter.uniqueItems,
        pattern: getPattern(parameter.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
        mediaType: null,
    };

    if (parameter.$ref) {
        const normalizedRef = normalizeRef(parameter.$ref, parentRef);
        const definitionRef = this.getType(parameter.$ref, normalizedRef);
        operationParameter.export = 'reference';
        operationParameter.type = definitionRef.type;
        operationParameter.base = definitionRef.base;
        operationParameter.template = definitionRef.template;
        operationParameter.imports.push(...definitionRef.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        operationParameter.path = definitionRef.path;
        return operationParameter;
    }

    if (parameter.enum) {
        const enumerators = getEnum(parameter.enum);
        const extendedEnumerators = extendEnum(enumerators, parameter);
        if (extendedEnumerators.length) {
            operationParameter.export = 'enum';
            operationParameter.type = 'string';
            operationParameter.base = 'string';
            operationParameter.enum.push(...extendedEnumerators);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }

    if ((parameter.type === 'int' || parameter.type === 'integer') && parameter.description) {
        const enumerators = getEnumFromDescription(parameter.description);
        if (enumerators.length) {
            operationParameter.export = 'enum';
            operationParameter.type = 'number';
            operationParameter.base = 'number';
            operationParameter.enum.push(...enumerators);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }

    if (parameter.type === 'array' && parameter?.items?.type) {
        const items = this.getType(parameter.items.type, '');
        operationParameter.export = 'array';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }

    if (parameter.type === 'object' && parameter?.items?.type) {
        const items = this.getType(parameter.items.type, '');
        operationParameter.export = 'dictionary';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }

    if (parameter.schema) {
        if (parameter.schema.$ref) {
            const model = this.getType(parameter.schema.$ref, '');
            operationParameter.export = 'reference';
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.imports.push(...model.imports);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        } else {
            const model = this.getModel({ openApi: openApi, definition: parameter.schema, parentRef: '' });
            operationParameter.export = model.export;
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.link = model.link;
            operationParameter.imports.push(...model.imports);
            operationParameter.enum.push(...model.enum);
            operationParameter.enums.push(...model.enums);
            operationParameter.properties.push(...model.properties);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }

    // If the parameter has a type than it can be a basic or generic type.
    if (parameter.type) {
        const definitionType = this.getType(parameter.type, '');
        operationParameter.export = 'generic';
        operationParameter.type = definitionType.type;
        operationParameter.base = definitionType.base;
        operationParameter.template = definitionType.template;
        operationParameter.imports.push(...definitionType.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }

    return operationParameter;
}
