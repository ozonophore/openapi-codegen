import type { OpenApiPath } from './OpenApiPath';
import type { OpenApiReference } from '../../types/OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#callbackObject
 */
export interface OpenApiCallback extends OpenApiReference {
    [key: string]: OpenApiPath;
}
