import type { Enum } from '../types/shared/Enum.model';
import type { Model } from '../types/shared/Model.model';

/**
 * Set unique enum values for the model
 * @param model
 */
export function postProcessModelEnum(model: Model): Enum[] {
    return model?.enum?.filter((property, index, arr) => {
        return arr.findIndex(item => item.name === property.name) === index;
    });
}
