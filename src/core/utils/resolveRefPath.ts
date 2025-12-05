import { advancedDeduplicatePath } from './advancedDeduplicatePath';
import { ParsedRef, RefType } from './parseRef';
import { dirName,  resolve } from './pathHelpers';

/**
 * Resolve a parsed reference to an absolute path (when applicable).
 * parentFilePath is expected to be a file path (absolute or relative).
 */
export function resolveRefPath(parsedRef: ParsedRef, parentFilePath: string): string {
    // For correct operation, parentDir must be the path to the directory, not the file.
    const parentDir = dirName(parentFilePath.split('#')[0]);

    switch (parsedRef.type) {
        case RefType.LOCAL_FRAGMENT:
            // For local fragments, use the parent file path
            return parentFilePath.split('#')[0];

        case RefType.EXTERNAL_FILE:
        case RefType.EXTERNAL_FILE_FRAGMENT:
            // Resolve relative to parent file directory
            if (parsedRef.filePath) {
                const resolvedPath = resolve(parentDir, parsedRef.filePath);
                // Clean any duplicate path segments
                return advancedDeduplicatePath(resolvedPath);
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
