import path from 'path';

/**
 * Checks whether `child` is a subdirectory of `parent`
 * @param parent Parent directory (absolute path)
 * @param child Child directory (absolute or relative path)
 */
export function isSubDirectory(parent: string, child: string) {
    const parentNormalized = path.resolve(parent);
    const childNormalized = path.resolve(parentNormalized, child);
    const relative = path.relative(parentNormalized, childNormalized);
    return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}
