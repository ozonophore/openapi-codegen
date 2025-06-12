import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiExample } from './OpenApiExample.model';
import type { OpenApiSchema } from './OpenApiSchema.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#headerObject
 */
export interface OpenApiHeader extends OpenApiReference {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: OpenApiSchema;
    example?: any;
    examples?: Dictionary<OpenApiExample>;
}
