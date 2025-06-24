import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiPath } from './OpenApiPath.model';

// TODO: FIXME!

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#callbackObject
 */
export interface OpenApiCallback extends OpenApiReference {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [key: string]: OpenApiPath;
}
