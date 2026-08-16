import path from 'path';

import { dirNameHelper } from '../../common/utils/pathHelpers';
import { REGEX_BACKSLASH } from '../types/Consts';
import { ParsedRef, RefType } from './parseRef';

/**
 * Resolve a parsed reference to an absolute path (when applicable).
 * parentFilePath is expected to be a file path (absolute or relative).
 * Path APIs see only sourceFile — Pointer is split off first.
 */
export function resolveRefPath(parsedRef: ParsedRef, parentFilePath: string, pathApi: Pick<typeof path, 'dirname' | 'resolve'> = path): string {
    const sourceFile = parentFilePath.split('#')[0];
    const parentDir = dirNameHelper(sourceFile, pathApi);

    switch (parsedRef.type) {
        case RefType.LOCAL_FRAGMENT:
            return sourceFile;

        case RefType.EXTERNAL_FILE:
        case RefType.EXTERNAL_FILE_FRAGMENT:
            if (parsedRef.filePath) {
                return pathApi.resolve(parentDir, parsedRef.filePath).replace(REGEX_BACKSLASH, '/');
            }
            return sourceFile;

        case RefType.ABSOLUTE_PATH:
            return parsedRef.filePath || sourceFile;

        case RefType.HTTP_URL:
            return parsedRef.originalRef;

        default:
            return sourceFile;
    }
}
