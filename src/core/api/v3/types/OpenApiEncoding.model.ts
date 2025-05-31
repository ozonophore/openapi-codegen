import type { Dictionary } from '../../../types/shared/Dictionary.model';
import type { OpenApiHeader } from './OpenApiHeader.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#encodingObject
 */
export interface OpenApiEncoding {
    contentType?: string;
    headers?: Dictionary<OpenApiHeader>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}
