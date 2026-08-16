/**
 * Normalize path to prevent duplication issues
 */
export function normalizePath(path: string): string {
    // If path is empty (e.g. local fragment with no parent file), preserve emptiness
    if (!path) {
        return '';
    }

    // Remove any duplicate slashes
    let normalized = path.replace(/\/+/g, '/');

    // Windows drive letter is already absolute — do not prepend `/` (`C:/...` must not become `/C:/...`)
    if (/^[A-Za-z]:/.test(normalized)) {
        return normalized;
    }

    // Ensure it starts with / for absolute paths
    if (!normalized.startsWith('./') && !normalized.startsWith('/') && !normalized.startsWith('http')) {
        normalized = `/${normalized}`;
    }

    return normalized;
}
