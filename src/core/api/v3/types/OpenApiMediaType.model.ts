import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiEncoding } from './OpenApiEncoding.model';
import type { OpenApiExample } from './OpenApiExample.model';
import type { OpenApiSchema } from './OpenApiSchema.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#mediaTypeObject
 */
export interface OpenApiMediaType extends OpenApiReference {
    schema?: OpenApiSchema;
    example?: any;
    examples?: Dictionary<OpenApiExample>;
    encoding?: Dictionary<OpenApiEncoding>;
}
