import type { OpenApiComponents } from './OpenApiComponents.model';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs.model';
import type { OpenApiInfo } from './OpenApiInfo.model';
import type { OpenApiPaths } from './OpenApiPaths.model';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement.model';
import type { OpenApiServer } from './OpenApiServer.model';
import type { OpenApiTag } from './OpenApiTag.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md
 */
export interface OpenApi {
    openapi: string;
    info: OpenApiInfo;
    servers?: OpenApiServer[];
    paths: OpenApiPaths;
    components?: OpenApiComponents;
    security?: OpenApiSecurityRequirement[];
    tags?: OpenApiTag[];
    externalDocs?: OpenApiExternalDocs;
}
