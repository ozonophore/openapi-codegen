import { getPathAdapter, type PathAdapter } from '../../common/utils/pathAdapter';

export enum RefType {
    LOCAL_FRAGMENT = 'local_fragment',
    EXTERNAL_FILE = 'external_file',
    EXTERNAL_FILE_FRAGMENT = 'external_file_fragment',
    HTTP_URL = 'http_url',
    ABSOLUTE_PATH = 'absolute_path',
}

export interface ParsedRef {
    type: RefType;
    filePath?: string;
    fragment?: string;
    originalRef: string;
}

/**
 * Parse a $ref string to determine its type and components.
 * Splits Canonical Ref (`sourceFile` + Pointer) before any path API.
 */
export function parseRef(ref: string, pathAdapter: PathAdapter = getPathAdapter()): ParsedRef {
    if (!ref || typeof ref !== 'string') {
        return { type: RefType.LOCAL_FRAGMENT, originalRef: ref };
    }
    // HTTP URLs
    if (ref.startsWith('http://') || ref.startsWith('https://')) {
        return {
            type: RefType.HTTP_URL,
            originalRef: ref,
        };
    }

    const hashIndex = ref.indexOf('#');
    const sourceFile = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
    const fragment = hashIndex === -1 ? undefined : ref.slice(hashIndex);

    // Local fragment (Pointer only)
    if (!sourceFile) {
        return {
            type: RefType.LOCAL_FRAGMENT,
            fragment,
            originalRef: ref,
        };
    }

    // Absolute paths — path API sees only sourceFile
    if (pathAdapter.isAbsolute(sourceFile)) {
        return {
            type: RefType.ABSOLUTE_PATH,
            filePath: sourceFile,
            fragment,
            originalRef: ref,
        };
    }

    if (fragment) {
        return {
            type: RefType.EXTERNAL_FILE_FRAGMENT,
            filePath: sourceFile,
            fragment,
            originalRef: ref,
        };
    }

    return {
        type: RefType.EXTERNAL_FILE,
        filePath: sourceFile,
        originalRef: ref,
    };
}
