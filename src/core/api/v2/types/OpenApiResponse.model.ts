import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiExample } from './OpenApiExample.model';
import type { OpenApiHeader } from './OpenApiHeader.model';
import type { OpenApiSchema } from './OpenApiSchema.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responseObject
 */
export interface OpenApiResponse extends OpenApiReference {
    description: string;
    schema?: OpenApiSchema & OpenApiReference;
    headers?: Dictionary<OpenApiHeader>;
    examples?: OpenApiExample;
}
