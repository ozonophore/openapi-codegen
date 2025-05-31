import type { WithEnumExtension } from '../../../types/shared/extensions/WithEnumExtension.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#serverVariableObject
 */
export interface OpenApiServerVariable extends WithEnumExtension {
    enum?: (string | number)[];
    default: string;
    description?: string;
}
