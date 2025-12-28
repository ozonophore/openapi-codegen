import path from 'path';

import { REGEX_BACKSLASH } from '../../core/types/Consts';

export function dirNameHelper(p: string): string {
    return path.dirname(p).replace(REGEX_BACKSLASH, '/');
}

export function joinHelper(...paths: string[]): string {
    return path.join(...paths).replace(REGEX_BACKSLASH, '/');
}

export function relativeHelper(from: string, to: string): string {
    // Defensive defaults
    const fromSafe = from || '.';
    const toSafe = to || '.';

    // Get native relative and convert to POSIX separators
    const relativePath = path.relative(fromSafe, toSafe).replace(REGEX_BACKSLASH, '/');

    // If empty -> same path
    if (!relativePath || relativePath === '') {
        return './';
    }

    // If result is absolute (starts with '/'), return normalized absolute
    if (relativePath.startsWith('/')) {
        return relativePath;
    }

    // If it already starts with '.' (./ or ../) return as-is
    if (relativePath.startsWith('.')) {
        return relativePath;
    }

    // Otherwise make explicit relative path (./something)
    return `./${relativePath}`;
}

export function resolveHelper(...pathSegments: string[]): string {
    return path.resolve(...pathSegments).replace(REGEX_BACKSLASH, '/');
}

export function normalizeHelper(p: string): string {
    return path.normalize(p).replace(REGEX_BACKSLASH, '/');
}
