import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiServer } from './OpenApiServer.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#linkObject
 */
export interface OpenApiLink extends OpenApiReference {
    operationRef?: string;
    operationId?: string;
    parameters?: Dictionary<any>;
    requestBody?: any;
    description?: string;
    server?: OpenApiServer;
}
