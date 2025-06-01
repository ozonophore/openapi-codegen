import type { Enum } from '../types/shared/Enum';
import type { Model } from '../types/shared/Model';

/**
 * Set unique enum values for the model
 * @param model
 */
export function postProcessModelEnum(model: Model): Enum[] {
    return model?.enum?.filter((property, index, arr) => {
        return arr.findIndex(item => item.name === property.name) === index;
    });
}
