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
 * Parse a $ref string to determine its type and components
 */
export function parseRef(ref: string): ParsedRef {
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

    // Absolute paths (POSIX/Windows handled by path.isAbsolute)
    if (path.isAbsolute(ref)) {
        const [filePath, fragment] = ref.split('#');
        return {
            type: RefType.ABSOLUTE_PATH,
            filePath,
            fragment: fragment ? `#${fragment}` : undefined,
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

    // External file references (may include fragment)
    const [filePath, fragment] = ref.split('#');
    if (fragment) {
        return {
            type: RefType.EXTERNAL_FILE_FRAGMENT,
            filePath,
            fragment: `#${fragment}`,
            originalRef: ref,
        };
    }

    return {
        type: RefType.EXTERNAL_FILE,
        filePath,
        originalRef: ref,
    };
}
