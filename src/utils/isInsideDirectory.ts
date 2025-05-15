import { normalizedAbsolutePath } from './normalizedAbsolutePath';

/**
 * Checks that the child path contains the parent path.
 * That is, the child directory is located inside the parent directory.
 * The comparison takes place along absolute paths.
 * @param childPath Child path.
 * @param parentPath Parent path.
 */
export function isInsideDirectory(childPath: string, parentPath: string) {
    const normalizedParent = normalizedAbsolutePath(parentPath);
    const normalizedChild = normalizedAbsolutePath(childPath);

    return normalizedChild.toLowerCase().startsWith(normalizedParent.toLowerCase());
}
