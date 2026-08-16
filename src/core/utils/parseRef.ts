import path from 'path';

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
 * Split sourceFile from Pointer before any path API sees the string.
 */
export function parseRef(ref: string, pathApi: { isAbsolute(value: string): boolean } = path): ParsedRef {
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

    // Local fragment
    if (ref.startsWith('#/')) {
        return {
            type: RefType.LOCAL_FRAGMENT,
            fragment: ref,
            originalRef: ref,
        };
    }

    const hashIndex = ref.indexOf('#');
    const filePath = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
    const fragment = hashIndex === -1 || hashIndex === ref.length - 1 ? undefined : ref.slice(hashIndex);

    // Absolute paths (POSIX/Windows handled by injectable path.isAbsolute on sourceFile only)
    if (pathApi.isAbsolute(filePath)) {
        return {
            type: RefType.ABSOLUTE_PATH,
            filePath,
            fragment,
            originalRef: ref,
        };
    }

    if (fragment) {
        return {
            type: RefType.EXTERNAL_FILE_FRAGMENT,
            filePath,
            fragment,
            originalRef: ref,
        };
    }

    return {
        type: RefType.EXTERNAL_FILE,
        filePath,
        originalRef: ref,
    };
}

/**
 * Whole-file Canonical Ref (no Pointer) is a Model.
 * Response / Parameter / Header / Request Body pointers are not Models.
 * Other Pointers (Schema registry and schema fragments such as `#/properties/...`) stay Models.
 */
export function isModelCanonicalRef(canonicalRef: string): boolean {
    const hashIndex = canonicalRef.indexOf('#');
    if (hashIndex === -1) {
        return true;
    }
    const pointer = canonicalRef.slice(hashIndex);
    return (
        !pointer.startsWith('#/components/responses/') &&
        !pointer.startsWith('#/components/parameters/') &&
        !pointer.startsWith('#/components/headers/') &&
        !pointer.startsWith('#/components/requestBodies/') &&
        !pointer.startsWith('#/responses/') &&
        !pointer.startsWith('#/parameters/')
    );
}
