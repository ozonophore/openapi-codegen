import { getPathAdapter, type PathAdapter } from '../../common/utils/pathAdapter';

function isWindowsDrivePath(filePath: string): boolean {
    return /^[A-Za-z]:[\\/]/.test(filePath);
}

/**
 * Normalize a sourceFile path to prevent duplication issues.
 * Must not receive `file#pointer` — callers split Canonical Ref first.
 */
export function normalizePath(filePath: string, pathAdapter: PathAdapter = getPathAdapter()): string {
    // If path is empty (e.g. local fragment with no parent file), preserve emptiness
    if (!filePath) {
        return '';
    }

    // Remove any duplicate slashes
    let normalized = filePath.replace(/\/+/g, '/');

    // Do not prepend / to an already-absolute path (Windows drive letter C:/... must not become /C:/...)
    if (pathAdapter.isAbsolute(normalized) || isWindowsDrivePath(normalized) || normalized.startsWith('./') || normalized.startsWith('/') || normalized.startsWith('http')) {
        return normalized;
    }

    return `/${normalized}`;
}
