import path from 'path';

import { Import } from '../types/shared/Import.model';
import type { Model } from '../types/shared/Model.model';
import { sort } from './sort';
import { unique } from './unique';

function normalizePath(value: string): string {
    return value.startsWith('./') ? value.slice(2) : value;
}

/**
 * Set unique imports, sorted by name
 * @param model The model that is post-processed
 */
export function postProcessModelImports(model: Model): Import[] {
    const currentModelPath = normalizePath(model.path);
    const currentModelDir = path.posix.dirname(currentModelPath);

    return model?.imports
        ?.filter(unique)
        ?.sort(sort)
        ?.filter(item => {
            const importPath = normalizePath(item.path);
            const resolvedFromCurrentModel = path.posix.normalize(path.posix.join(currentModelDir, importPath));
            return resolvedFromCurrentModel !== currentModelPath;
        });
}
