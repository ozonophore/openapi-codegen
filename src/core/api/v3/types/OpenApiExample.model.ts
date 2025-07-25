import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#exampleObject
 */
export interface OpenApiExample extends OpenApiReference {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
}
