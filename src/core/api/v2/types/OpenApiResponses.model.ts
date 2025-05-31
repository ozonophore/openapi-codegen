import { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiResponse } from './OpenApiResponse.model';

// TODO: FIXME!

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responsesObject
 */
export interface OpenApiResponses extends OpenApiReference {
    // @ts-ignore
    default?: OpenApiResponse;
    // @ts-ignore
    [httpcode: string]: OpenApiResponse;
}
