import path from 'path';

import { REGEX_BACKSLASH } from '../types/Consts';
import { ParsedRef, type PathApi, RefType } from './parseRef';

/**
 * Resolve a parsed reference to an absolute path (when applicable).
 * parentFilePath is expected to be a file path (absolute or relative); Pointer is stripped first.
 */
export function resolveRefPath(parsedRef: ParsedRef, parentFilePath: string, pathApi: PathApi = path): string {
    const parentSourceFile = parentFilePath.split('#')[0];
    const parentDir = pathApi.dirname(parentSourceFile).replace(REGEX_BACKSLASH, '/');

    switch (parsedRef.type) {
        case RefType.LOCAL_FRAGMENT:
            return parentSourceFile;

        case RefType.EXTERNAL_FILE:
        case RefType.EXTERNAL_FILE_FRAGMENT:
            if (parsedRef.filePath) {
                return pathApi.resolve(parentDir, parsedRef.filePath).replace(REGEX_BACKSLASH, '/');
            }
            return parentSourceFile;

        case RefType.ABSOLUTE_PATH:
            return parsedRef.filePath || parentSourceFile;

        case RefType.HTTP_URL:
            return parsedRef.originalRef;

        default:
            return parentSourceFile;
    }
}
