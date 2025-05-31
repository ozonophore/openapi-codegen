import type { WithEnumExtension } from '../../../types/shared/extensions/WithEnumExtension.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { WithNullableExtension } from './Extensions/WithNullableExtension.model';
import type { OpenApiItems } from './OpenApiItems.model';
import type { OpenApiSchema } from './OpenApiSchema.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterObject
 */
export interface OpenApiParameter extends OpenApiReference, WithEnumExtension, WithNullableExtension {
    name: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'body';
    description?: string;
    required?: boolean;
    schema?: OpenApiSchema;
    type?: string;
    format?: 'int32' | 'int64' | 'float' | 'double' | 'string' | 'boolean' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
    allowEmptyValue?: boolean;
    items?: OpenApiItems;
    collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi';
    default?: any;
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
    enum?: (string | number)[];
    multipleOf?: number;
}
