import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiHeader } from './OpenApiHeader.model';
import type { OpenApiLink } from './OpenApiLink.model';
import type { OpenApiMediaType } from './OpenApiMediaType.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#responseObject
 */
export interface OpenApiResponse extends OpenApiReference {
    description: string;
    headers?: Dictionary<OpenApiHeader>;
    content?: Dictionary<OpenApiMediaType>;
    links?: Dictionary<OpenApiLink>;
}
