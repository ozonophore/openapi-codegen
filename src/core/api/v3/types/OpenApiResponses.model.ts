import type { OpenApiReference } from '../../../types/shared/OpenApiReference.model';
import type { OpenApiResponse } from './OpenApiResponse.model';

// TODO: FIXME!

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#responsesObject
 */
export interface OpenApiResponses extends OpenApiReference {
    default: OpenApiResponse;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [httpcode: string]: OpenApiResponse;
}
