import path from "path";

import { relativeHelper, resolveHelper } from "../../common/utils/pathHelpers";


/**
 * Checks whether `child` is a subdirectory of `parent`
 * @param parent Parent directory (absolute path)
 * @param child Child directory (absolute or relative path)
 */
export function isSubDirectory(parent: string, child: string) {
    const parentNormalized = resolveHelper(parent);
    const childNormalized = resolveHelper(parentNormalized, child);
    const relative = relativeHelper(parentNormalized, childNormalized);
    return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}
