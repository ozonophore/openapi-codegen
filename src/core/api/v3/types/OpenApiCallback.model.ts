import type { OpenApiPath } from './OpenApiPath.model';
import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';

// TODO: FIXME!

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#callbackObject
 */
export interface OpenApiCallback extends OpenApiReference {
    // @ts-ignore
    [key: string]: OpenApiPath;
}
