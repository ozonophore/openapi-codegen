import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiMediaType } from './OpenApiMediaType.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#requestBodyObject
 */
export interface OpenApiRequestBody extends OpenApiReference {
    description?: string;
    content: Dictionary<OpenApiMediaType>;
    required?: boolean;
    nullable?: boolean;
}
