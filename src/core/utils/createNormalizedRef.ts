import { ParsedRef, RefType } from './parseRef';

/**
 * Create normalized reference string from parsedRef and resolvedPath.
 * If resolvedPath is a URL, preserve it.
 */
export function createNormalizedRef(parsedRef: ParsedRef, resolvedPath: string): string {
    switch (parsedRef.type) {
        case RefType.LOCAL_FRAGMENT:
            return `${resolvedPath}${parsedRef.fragment ?? ''}`;
        case RefType.EXTERNAL_FILE:
            return resolvedPath;
        case RefType.EXTERNAL_FILE_FRAGMENT:
            return `${resolvedPath}${parsedRef.fragment ?? ''}`;
        case RefType.ABSOLUTE_PATH:
            return parsedRef.fragment ? `${resolvedPath}${parsedRef.fragment}` : resolvedPath;
        case RefType.HTTP_URL:
            return parsedRef.originalRef;
        default:
            return resolvedPath;
    }
}