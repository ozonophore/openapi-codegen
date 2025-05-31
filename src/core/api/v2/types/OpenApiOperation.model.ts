import type { OpenApiExternalDocs } from './OpenApiExternalDocs.model';
import type { OpenApiParameter } from './OpenApiParameter.model';
import type { OpenApiResponses } from './OpenApiResponses.model';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject
 */
export interface OpenApiOperation {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: OpenApiExternalDocs;
    operationId?: string;
    consumes?: string[];
    produces?: string[];
    parameters?: OpenApiParameter[];
    responses: OpenApiResponses;
    schemes: ('http' | 'https' | 'ws' | 'wss')[];
    deprecated?: boolean;
    security?: OpenApiSecurityRequirement[];
}
