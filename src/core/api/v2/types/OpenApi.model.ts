import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs.model';
import type { OpenApiInfo } from './OpenApiInfo.model';
import type { OpenApiParameter } from './OpenApiParameter.model';
import type { OpenApiPath } from './OpenApiPath.model';
import type { OpenApiResponse } from './OpenApiResponse.model';
import type { OpenApiSchema } from './OpenApiSchema.model';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement.model';
import type { OpenApiSecurityScheme } from './OpenApiSecurityScheme.model';
import type { OpenApiTag } from './OpenApiTag.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md
 */
export interface OpenApi {
    swagger: string;
    info: OpenApiInfo;
    host?: string;
    basePath?: string;
    schemes?: string[];
    consumes?: string[];
    produces?: string[];
    paths: Dictionary<OpenApiPath>;
    definitions?: Dictionary<OpenApiSchema>;
    parameters?: Dictionary<OpenApiParameter>;
    responses?: Dictionary<OpenApiResponse>;
    securityDefinitions?: Dictionary<OpenApiSecurityScheme>;
    security?: OpenApiSecurityRequirement[];
    tags?: OpenApiTag[];
    externalDocs?: OpenApiExternalDocs;
}
