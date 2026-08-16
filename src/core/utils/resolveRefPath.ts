import { getPathAdapter, type PathAdapter } from '../../common/utils/pathAdapter';
import { dirNameHelper } from '../../common/utils/pathHelpers';
import { REGEX_BACKSLASH } from '../types/Consts';
import { ParsedRef, RefType } from './parseRef';

/**
 * Resolve a parsed reference to an absolute path (when applicable).
 * parentFilePath is expected to be a file path (absolute or relative).
 */
export function resolveRefPath(parsedRef: ParsedRef, parentFilePath: string, pathAdapter: PathAdapter = getPathAdapter()): string {
    // Path APIs see only sourceFile — split Canonical Ref first.
    const parentSourceFile = parentFilePath.split('#')[0];
    const parentDir = dirNameHelper(parentSourceFile, pathAdapter);

    switch (parsedRef.type) {
        case RefType.LOCAL_FRAGMENT:
            // For local fragments, use the parent file path
            return parentSourceFile;

        case RefType.EXTERNAL_FILE:
        case RefType.EXTERNAL_FILE_FRAGMENT:
            // Resolve relative to parent file directory
            if (parsedRef.filePath) {
                return pathAdapter.resolve(parentDir, parsedRef.filePath).replace(REGEX_BACKSLASH, '/');
            }
            return parentFilePath;

        case RefType.ABSOLUTE_PATH:
            return parsedRef.filePath || parentFilePath;

        case RefType.HTTP_URL:
            return parsedRef.originalRef;

        default:
            return parentFilePath;
    }
}
