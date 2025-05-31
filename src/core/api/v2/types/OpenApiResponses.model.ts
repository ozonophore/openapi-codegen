import { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiResponse } from './OpenApiResponse.model';

// TODO: FIXME!

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responsesObject
 */
export interface OpenApiResponses extends OpenApiReference {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    default?: OpenApiResponse;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [httpcode: string]: OpenApiResponse;
}
