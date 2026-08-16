import path from 'path';

import { createNormalizedRef } from './createNormalizedRef';
import { normalizePath } from './normalizePath';
import { parseRef, type PathApi } from './parseRef';
import { resolveRefPath } from './resolveRefPath';

/**
 * Normalize a single $ref (returns normalized resolved path + fragment when present).
 * Path APIs see only the source file; Pointer is reattached after path ops.
 */
export function normalizeRef(ref: string, parentFilePath: string, pathApi: PathApi = path): string {
    const parsedRef = parseRef(ref, pathApi);
    const resolvedPath = resolveRefPath(parsedRef, parentFilePath, pathApi);

    // Normalize the path to prevent duplication issues
    const normalizedPath = normalizePath(resolvedPath);

    return createNormalizedRef(parsedRef, normalizedPath);
}
