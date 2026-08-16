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

/** Injectable Node path API. Tests pass `path.win32`; production uses the platform default. */
export type PathApi = Pick<typeof path, 'isAbsolute' | 'normalize' | 'dirname' | 'resolve'>;

/**
 * Parse a $ref string to determine its type and components.
 * Always splits Pointer from source file first so path APIs never see `file#pointer`.
 */
export function parseRef(ref: string, pathApi: PathApi = path): ParsedRef {
    if (!ref || typeof ref !== 'string') {
        return { type: RefType.LOCAL_FRAGMENT, originalRef: ref };
    }

    const hashIndex = ref.indexOf('#');
    const sourceFile = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
    const fragment = hashIndex === -1 ? undefined : ref.slice(hashIndex);

    if (sourceFile.startsWith('http://') || sourceFile.startsWith('https://')) {
        return {
            type: RefType.HTTP_URL,
            originalRef: ref,
        };
    }

    if (!sourceFile) {
        return {
            type: RefType.LOCAL_FRAGMENT,
            fragment,
            originalRef: ref,
        };
    }

    if (pathApi.isAbsolute(sourceFile)) {
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
