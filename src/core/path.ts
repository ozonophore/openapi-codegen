import path from 'path';

const SEARCH_REGEXP = /\\/g;

export function dirName(p: string): string {
    return path.dirname(p).replace(SEARCH_REGEXP, '/');
}

export function join(...paths: string[]): string {
    return path.join(...paths).replace(SEARCH_REGEXP, '/');
}

export function relative(from: string, to: string): string {
    const value = `./${path.relative(from, to)}`;
    const hasSlash = value.length > 0 && value.endsWith('/');
    return `${value.replace(SEARCH_REGEXP, '/')}`.concat(hasSlash ? '' : '/');
}

export function resolve(...pathSegments: string[]): string {
    return path.resolve(...pathSegments).replace(SEARCH_REGEXP, '/');
}

export function normalize(p: string): string {
    return path.normalize(p).replace(SEARCH_REGEXP, '/');
}
