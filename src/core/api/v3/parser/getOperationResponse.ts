import get from 'lodash-es/get'

import type { OperationResponse } from '../../../types/shared/OperationResponse.model';
import { getComment } from '../../../utils/getComment';
import { getPattern } from '../../../utils/getPattern';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiResponse } from '../types/OpenApiResponse.model';
import { getContent } from './getContent';

export function getOperationResponse(this: Parser, openApi: OpenApi, response: OpenApiResponse, responseCode: number, parentRef: string): OperationResponse {
    const operationResponse: OperationResponse = {
        in: 'response',
        name: '',
        alias: '',
        path: '',
        code: responseCode,
        description: getComment(response.description)!,
        export: 'generic',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };

    if (response.content) {
        const content = getContent(response.content);
        if (content) {
            if (content?.schema?.$ref) {
                const model = this.getType(content.schema.$ref, parentRef);
                operationResponse.export = 'reference';
                operationResponse.type = model.type;
                operationResponse.base = model.base;
                operationResponse.path = model.path;
                operationResponse.template = model.template;
                operationResponse.imports.push(...model.imports);
                return operationResponse;
            } else {
                const model = this.getModel({ openApi: openApi, definition: content.schema, parentRef: parentRef });
                operationResponse.export = model.export;
                operationResponse.type = model.type;
                operationResponse.base = model.base;
                operationResponse.path = model.path;
                operationResponse.template = model.template;
                operationResponse.link = model.link;
                operationResponse.isReadOnly = model.isReadOnly;
                operationResponse.isRequired = model.isRequired;
                operationResponse.isNullable = model.isNullable;
                operationResponse.format = model.format;
                operationResponse.maximum = model.maximum;
                operationResponse.exclusiveMaximum = model.exclusiveMaximum;
                operationResponse.minimum = model.minimum;
                operationResponse.exclusiveMinimum = model.exclusiveMinimum;
                operationResponse.multipleOf = model.multipleOf;
                operationResponse.maxLength = model.maxLength;
                operationResponse.minLength = model.minLength;
                operationResponse.maxItems = model.maxItems;
                operationResponse.minItems = model.minItems;
                operationResponse.uniqueItems = model.uniqueItems;
                operationResponse.maxProperties = model.maxProperties;
                operationResponse.minProperties = model.minProperties;
                operationResponse.pattern = getPattern(model.pattern);
                operationResponse.imports.push(...model.imports);
                operationResponse.enum.push(...model.enum);
                operationResponse.enums.push(...model.enums);
                operationResponse.properties.push(...model.properties);
                return operationResponse;
            }
        }
    }

    // We support basic properties from response headers, since both
    // fetch and XHR client just support string types.
    if (response.headers) {
        for (const name in response.headers) {
            if (get(response.headers, name, null)) {
                operationResponse.in = 'header';
                operationResponse.name = name;
                operationResponse.type = 'string';
                operationResponse.base = 'string';
                return operationResponse;
            }
        }
    }

    return operationResponse;
}
