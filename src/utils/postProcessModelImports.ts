import { Import } from '../client/interfaces/Import';
import type { Model } from '../client/interfaces/Model';
import { sort } from './sort';
import { unique } from './unique';

/**
 * Set unique imports, sorted by name
 * @param model The model that is post-processed
 */
export function postProcessModelImports(model: Model): Import[] {
    return model?.imports
        ?.filter(unique)
        ?.sort(sort)
        ?.filter(item => model.name !== item.name);
}
