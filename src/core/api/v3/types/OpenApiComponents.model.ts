import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiCallback } from './OpenApiCallback.model';
import type { OpenApiExample } from './OpenApiExample.model';
import type { OpenApiHeader } from './OpenApiHeader.model';
import type { OpenApiLink } from './OpenApiLink.model';
import type { OpenApiParameter } from './OpenApiParameter.model';
import type { OpenApiRequestBody } from './OpenApiRequestBody.model';
import type { OpenApiResponses } from './OpenApiResponses.model';
import type { OpenApiSchema } from './OpenApiSchema.model';
import type { OpenApiSecurityScheme } from './OpenApiSecurityScheme.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#componentsObject
 */
export interface OpenApiComponents {
    schemas?: Dictionary<OpenApiSchema>;
    responses?: Dictionary<OpenApiResponses>;
    parameters?: Dictionary<OpenApiParameter>;
    examples?: Dictionary<OpenApiExample>;
    requestBodies?: Dictionary<OpenApiRequestBody>;
    headers?: Dictionary<OpenApiHeader>;
    securitySchemes?: Dictionary<OpenApiSecurityScheme>;
    links?: Dictionary<OpenApiLink>;
    callbacks?: Dictionary<OpenApiCallback>;
}
