import { dirname, relative, sep } from 'path';

/**
 * Computes the relative import path from a stub file to its canonical file,
 * suitable for use in `export * from '...'`.
 *
 * @param stubPath      Absolute path to the stub file (e.g. `/project/out/api-a/models/UserDto.ts`)
 * @param canonicalPath Absolute path to the canonical file (e.g. `/project/out/__shared__/models/UserDto.ts`)
 */
export function computeStoreRelativeImport(stubPath: string, canonicalPath: string): string {
    const stubDir = dirname(stubPath);
    const relativePath = relative(stubDir, canonicalPath);

    // Normalize to POSIX separators and strip .ts extension for import
    const normalized = relativePath.replace(new RegExp(`\\${sep}`, 'g'), '/').replace(/\.ts$/, '');

    // Ensure the path starts with ./ or ../
    return normalized.startsWith('.') ? normalized : `./${normalized}`;
}
