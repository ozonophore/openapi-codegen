import path from 'path';

import { SEARCH_REGEXP } from '../types/Consts';

export function dirName(p: string): string {
    return path.dirname(p).replace(SEARCH_REGEXP, '/');
}

export function join(...paths: string[]): string {
    return path.join(...paths).replace(SEARCH_REGEXP, '/');
}

export function relative(from: string, to: string): string {
    // Defensive defaults
    const fromSafe = from || '.';
    const toSafe = to || '.';

    // Get native relative and convert to POSIX separators
    const relativePath = path.relative(fromSafe, toSafe).replace(SEARCH_REGEXP, '/');

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

export function resolve(...pathSegments: string[]): string {
    return path.resolve(...pathSegments).replace(SEARCH_REGEXP, '/');
}

export function normalize(p: string): string {
    return path.normalize(p).replace(SEARCH_REGEXP, '/');
}

export function joinToDir(parentFilePath: string, fileName: string): string {
  return resolve(dirName(parentFilePath), fileName);
}