import path from 'path';

/**
 * Injectable path seam for Canonical Ref lookup.
 * Path APIs must see only `sourceFile`, never `file#pointer`.
 */
export interface PathAdapter {
    isAbsolute(p: string): boolean;
    normalize(p: string): string;
    dirname(p: string): string;
    resolve(...pathSegments: string[]): string;
}

export const platformPathAdapter: PathAdapter = path;

let activePathAdapter: PathAdapter = platformPathAdapter;

export function getPathAdapter(): PathAdapter {
    return activePathAdapter;
}

export function setPathAdapter(adapter: PathAdapter): void {
    activePathAdapter = adapter;
}

export function withPathAdapter<T>(adapter: PathAdapter, fn: () => T): T {
    const previous = activePathAdapter;
    activePathAdapter = adapter;
    try {
        return fn();
    } finally {
        activePathAdapter = previous;
    }
}
