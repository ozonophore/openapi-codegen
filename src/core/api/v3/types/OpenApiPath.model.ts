import { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiOperation } from './OpenApiOperation.model';
import type { OpenApiParameter } from './OpenApiParameter.model';
import type { OpenApiServer } from './OpenApiServer.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#pathItemObject
 */
export interface OpenApiPath extends OpenApiReference {
    summary?: string;
    description?: string;
    get?: OpenApiOperation;
    put?: OpenApiOperation;
    post?: OpenApiOperation;
    delete?: OpenApiOperation;
    options?: OpenApiOperation;
    head?: OpenApiOperation;
    patch?: OpenApiOperation;
    trace?: OpenApiOperation;
    servers?: OpenApiServer[];
    parameters?: OpenApiParameter[];
}
