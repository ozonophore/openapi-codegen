import type { OperationParameter } from '../../../types/shared/OperationParameter.model';
import { getPattern } from '../../../utils/getPattern';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiRequestBody } from '../types/OpenApiRequestBody.model';
import { getComment } from './getComment';
import { getContent } from './getContent';

export function getOperationRequestBody(this: Parser, openApi: OpenApi, parameter: OpenApiRequestBody, parentRef: string): OperationParameter {
    const requestBody: OperationParameter = {
        in: 'body',
        prop: 'body',
        export: 'interface',
        name: 'requestBody',
        alias: '',
        path: '',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: getComment(parameter.description),
        default: undefined,
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

    if (parameter.content) {
        const content = getContent(parameter.content);
        if (content) {
            requestBody.mediaType = content.mediaType;
            if (requestBody.mediaType === 'multipart/form-data') {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                (requestBody.in = 'formData'), (requestBody.name = 'formData'), (requestBody.prop = 'formData');
            }
            if (content?.schema?.$ref) {
                const model = this.getType(content.schema.$ref, parentRef);
                requestBody.export = 'reference';
                requestBody.type = model.type;
                requestBody.base = model.base;
                requestBody.path = model.path;
                requestBody.template = model.template;
                requestBody.imports.push(...model.imports);
                return requestBody;
            } else {
                const model = this.getModel({ openApi: openApi, definition: content.schema, parentRef: parentRef });
                requestBody.export = model.export;
                requestBody.type = model.type;
                requestBody.base = model.base;
                requestBody.path = model.path;
                requestBody.template = model.template;
                requestBody.link = model.link;
                requestBody.isReadOnly = model.isReadOnly;
                requestBody.isRequired = requestBody.isRequired || model.isRequired;
                requestBody.isNullable = requestBody.isNullable || model.isNullable;
                requestBody.format = model.format;
                requestBody.maximum = model.maximum;
                requestBody.exclusiveMaximum = model.exclusiveMaximum;
                requestBody.minimum = model.minimum;
                requestBody.exclusiveMinimum = model.exclusiveMinimum;
                requestBody.multipleOf = model.multipleOf;
                requestBody.maxLength = model.maxLength;
                requestBody.minLength = model.minLength;
                requestBody.maxItems = model.maxItems;
                requestBody.minItems = model.minItems;
                requestBody.uniqueItems = model.uniqueItems;
                requestBody.maxProperties = model.maxProperties;
                requestBody.minProperties = model.minProperties;
                requestBody.pattern = getPattern(model.pattern);
                requestBody.imports.push(...model.imports);
                requestBody.enum.push(...model.enum);
                requestBody.enums.push(...model.enums);
                requestBody.properties.push(...model.properties);
                return requestBody;
            }
        }
    }

    return requestBody;
}
