import path from 'path';

const SEARCH_REGEXP = /\\/g;

export function dirName(p: string): string {
    return path.dirname(p).replace(SEARCH_REGEXP, '/');
}

export function join(...paths: string[]): string {
    return path.join(...paths).replace(SEARCH_REGEXP, '/');
}

export function relative(from: string, to: string): string {
    return path.relative(from, to).replace(SEARCH_REGEXP, '/');
}

export function resolve(...pathSegments: string[]): string {
    return path.resolve(...pathSegments).replace(SEARCH_REGEXP, '/');
}
