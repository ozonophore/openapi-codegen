import type { OperationParameter } from '../../../types/shared/OperationParameter.model';
import { getComment } from '../../../utils/getComment';
import { getOperationParameterName } from '../../../utils/getOperationParameterName';
import { getPattern } from '../../../utils/getPattern';
import { normalizeRef } from '../../../utils/normalizeRef';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiParameter } from '../types/OpenApiParameter.model';
import { getModelDefault } from './getModelDefault';

export function getOperationParameter(this: Parser, openApi: OpenApi, parameter: OpenApiParameter, parentRef: string): OperationParameter {
    const operationParameter: OperationParameter = {
        in: parameter.in,
        prop: parameter.name,
        export: 'interface',
        name: getOperationParameterName(parameter.name),
        alias: '',
        path: '',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: getComment(parameter.description),
        isDefinition: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: parameter.nullable === true,
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
        return operationParameter;
    }

    if (parameter.schema) {
        if (parameter.schema.$ref) {
            const normalizedRef = normalizeRef(parameter.schema.$ref, parentRef);
            const model = this.getType(parameter.schema.$ref, normalizedRef);
            operationParameter.export = 'reference';
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.imports.push(...model.imports);
            operationParameter.default = getModelDefault(parameter.schema);
            return operationParameter;
        } else {
            const model = this.getModel({ openApi: openApi, definition: parameter.schema, parentRef: '' });
            operationParameter.export = model.export;
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.link = model.link;
            operationParameter.isReadOnly = model.isReadOnly;
            operationParameter.isRequired = operationParameter.isRequired || model.isRequired;
            operationParameter.isNullable = operationParameter.isNullable || model.isNullable;
            operationParameter.format = model.format;
            operationParameter.maximum = model.maximum;
            operationParameter.exclusiveMaximum = model.exclusiveMaximum;
            operationParameter.minimum = model.minimum;
            operationParameter.exclusiveMinimum = model.exclusiveMinimum;
            operationParameter.multipleOf = model.multipleOf;
            operationParameter.maxLength = model.maxLength;
            operationParameter.minLength = model.minLength;
            operationParameter.maxItems = model.maxItems;
            operationParameter.minItems = model.minItems;
            operationParameter.uniqueItems = model.uniqueItems;
            operationParameter.maxProperties = model.maxProperties;
            operationParameter.minProperties = model.minProperties;
            operationParameter.pattern = getPattern(model.pattern);
            operationParameter.default = model.default;
            operationParameter.imports.push(...model.imports);
            operationParameter.enum.push(...model.enum);
            operationParameter.enums.push(...model.enums);
            operationParameter.properties.push(...model.properties);
            return operationParameter;
        }
    }

    return operationParameter;
}
