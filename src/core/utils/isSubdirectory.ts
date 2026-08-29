import { relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';

function isSlashAbsolute(relative: string): boolean {
    return relative.startsWith('/') || /^[A-Za-z]:\//.test(relative);
}

/**
 * Checks whether `child` is a subdirectory of `parent`
 * @param parent Parent directory (absolute path)
 * @param child Child directory (absolute or relative path)
 */
export function isSubDirectory(parent: string, child: string) {
    const parentNormalized = resolveHelper(parent);
    const childNormalized = resolveHelper(parentNormalized, child);
    const relative = relativeHelper(parentNormalized, childNormalized);
    if (relative === '' || relative === './') {
        return false;
    }
    return !relative.startsWith('..') && !isSlashAbsolute(relative);
}
