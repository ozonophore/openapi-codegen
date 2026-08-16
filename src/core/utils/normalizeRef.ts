import { getPathAdapter, type PathAdapter } from '../../common/utils/pathAdapter';
import { createNormalizedRef } from './createNormalizedRef';
import { normalizePath } from './normalizePath';
import { parseRef } from './parseRef';
import { resolveRefPath } from './resolveRefPath';

/**
 * Normalize a single $ref (returns normalized resolved path + fragment when present).
 */
export function normalizeRef(ref: string, parentFilePath: string, pathAdapter: PathAdapter = getPathAdapter()): string {
    const parsedRef = parseRef(ref, pathAdapter);
    const resolvedPath = resolveRefPath(parsedRef, parentFilePath, pathAdapter);

    // Normalize the path to prevent duplication issues
    const normalizedPath = normalizePath(resolvedPath, pathAdapter);

    return createNormalizedRef(parsedRef, normalizedPath);
}
