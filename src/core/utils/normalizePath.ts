/**
 * Normalize a source-file path (never a serialized Canonical Ref).
 * Must not prepend `/` to a Windows drive letter (`C:/...` must not become `/C:/...`).
 */
export function normalizePath(filePath: string): string {
    // If path is empty (e.g. local fragment with no parent file), preserve emptiness
    if (!filePath) {
        return '';
    }

    let normalized = filePath.replace(/\\/g, '/').replace(/\/+/g, '/');

    if (normalized.startsWith('./') || normalized.startsWith('/') || normalized.startsWith('http') || /^[A-Za-z]:\//.test(normalized)) {
        return normalized;
    }

    return `/${normalized}`;
}
