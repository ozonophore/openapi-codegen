import type { Dictionary } from '../../../types/shared/Dictionary.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#discriminatorObject
 */
export interface OpenApiDiscriminator {
    propertyName: string;
    mapping?: Dictionary<string>;
}
