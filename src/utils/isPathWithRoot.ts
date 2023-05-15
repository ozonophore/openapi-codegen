import { resolve } from '../core/path';

/**
 * Checks if a relative path is outside the root directory.
 * @param rootPath Root folder path.
 * @param relativePath Relative folder path.
 */
export function isPathWithRoot(rootPath: string, relativePath: string): boolean {
    const absolutePath = resolve(rootPath, relativePath);

    return absolutePath.startsWith(rootPath);
}
