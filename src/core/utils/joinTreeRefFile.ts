import { REGEX_BACKSLASH } from '../types/Consts';

function isWindowsDrivePath(file: string): boolean {
    return /^[A-Za-z]:[\\/]/.test(file);
}

export function isFileUrl(file: string): boolean {
    return file.startsWith('file:');
}

export function toPosixSlashes(filePath: string): string {
    return filePath.replace(REGEX_BACKSLASH, '/');
}

/**
 * Absolute Parent source file or Tree $ref file: leading `/` or `C:` + slash.
 * Not `path.isAbsolute` (that is the process OS).
 */
export function isAbsoluteSourceFile(file: string): boolean {
    if (!file) {
        return false;
    }
    const posix = toPosixSlashes(file);
    if (posix.startsWith('/')) {
        return true;
    }
    return isWindowsDrivePath(posix);
}

function filePathToFileUrl(absolutePath: string): string {
    const posix = toPosixSlashes(absolutePath);
    if (isWindowsDrivePath(posix)) {
        return `file:///${posix}`;
    }
    if (posix.startsWith('/')) {
        return `file://${posix}`;
    }
    throw new Error(`Cannot build file URL from non-absolute path: ${absolutePath}`);
}

export function fileUrlToFilePath(fileUrl: URL): string {
    let pathname = decodeURIComponent(fileUrl.pathname);
    if (/^\/[A-Za-z]:/.test(pathname)) {
        pathname = pathname.slice(1);
    }
    return pathname;
}

/**
 * Parent source file + relative Tree $ref file → file path for a Canonical Ref.
 * Hand-built `file://` + `new URL`. Not `path.resolve`, not `pathToFileURL`.
 */
export function joinTreeRefFile(parentAbsolute: string, treeFile: string): string {
    const base = filePathToFileUrl(parentAbsolute);
    const url = new URL(toPosixSlashes(treeFile), base);
    if (url.protocol !== 'file:') {
        return url.href;
    }
    return fileUrlToFilePath(url);
}
