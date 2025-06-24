import type { Model } from '../types/shared/Model.model';
import { postProcessModelEnum } from './postProcessModelEnum';
import { postProcessModelEnums } from './postProcessModelEnums';
import { postProcessModelImports } from './postProcessModelImports';

/**
 * Post process the model.
 * This will cleanup any double imports or enum values.
 * @param model
 */
export function postProcessModel(model: Model): Model {
    return {
        ...model,
        imports: postProcessModelImports(model),
        enums: postProcessModelEnums(model),
        enum: postProcessModelEnum(model),
    };
}
