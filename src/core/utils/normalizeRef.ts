import { createNormalizedRef } from './createNormalizedRef';
import { normalizePath } from './normalizePath';
import { parseRef } from './parseRef';
import { resolveRefPath } from './resolveRefPath';

/**
 * Normalize a single $ref (returns normalized resolved path + fragment when present).
 */
export function normalizeRef(ref: string, parentFilePath: string): string {
    const parsedRef = parseRef(ref);
    const resolvedPath = resolveRefPath(parsedRef, parentFilePath);
    
    // Normalize the path to prevent duplication issues
    const normalizedPath = normalizePath(resolvedPath);
    
    return createNormalizedRef(parsedRef, normalizedPath);
}