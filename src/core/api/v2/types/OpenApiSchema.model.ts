import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { WithEnumExtension } from '../../../types/shared/extensions/WithEnumExtension.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { WithNullableExtension } from './Extensions/WithNullableExtension.model';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs.model';
import type { OpenApiXml } from './OpenApiXml.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schemaObject
 */
export interface OpenApiSchema extends OpenApiReference, WithEnumExtension, WithNullableExtension {
    title?: string;
    description?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: (string | number)[];
    type?: string;
    format?: 'int32' | 'int64' | 'float' | 'double' | 'string' | 'boolean' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
    items?: OpenApiSchema;
    allOf?: OpenApiSchema[];
    properties?: Dictionary<OpenApiSchema>;
    additionalProperties?: boolean | OpenApiSchema;
    discriminator?: string;
    readOnly?: boolean;
    xml?: OpenApiXml;
    externalDocs?: OpenApiExternalDocs;
    example?: any;
}
