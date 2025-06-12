import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiCallback } from './OpenApiCallback.model';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs.model';
import type { OpenApiParameter } from './OpenApiParameter.model';
import type { OpenApiRequestBody } from './OpenApiRequestBody.model';
import type { OpenApiResponses } from './OpenApiResponses.model';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement.model';
import type { OpenApiServer } from './OpenApiServer.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#operationObject
 */
export interface OpenApiOperation {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: OpenApiExternalDocs;
    operationId?: string;
    parameters?: OpenApiParameter[];
    requestBody?: OpenApiRequestBody;
    responses: OpenApiResponses;
    callbacks?: Dictionary<OpenApiCallback>;
    deprecated?: boolean;
    security?: OpenApiSecurityRequirement[];
    servers?: OpenApiServer[];
}
