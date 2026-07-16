import { sep } from 'path';

/**
 * Finds the Longest Common Ancestor (LCA) directory path for a set of absolute output paths.
 * Returns null when:
 * - fewer than 2 paths are provided (auto-group makes no sense for a single spec)
 * - the computed LCA is trivial (root of the filesystem or matches an input path exactly)
 */
export function resolveOutputGroups(absoluteOutputPaths: string[]): string | null {
    if (absoluteOutputPaths.length < 2) {
        return null;
    }

    const normalizedPaths = absoluteOutputPaths.map(p => p.replace(/\\/g, '/'));
    const splitPaths = normalizedPaths.map(p => p.split('/').filter(Boolean));

    const first = splitPaths[0]!;
    const commonParts: string[] = [];

    for (let i = 0; i < first.length; i++) {
        const part = first[i]!;
        if (splitPaths.every(parts => parts[i] === part)) {
            commonParts.push(part);
        } else {
            break;
        }
    }

    if (commonParts.length === 0) {
        return null;
    }

    const lca = (normalizedPaths[0]!.startsWith('/') ? '/' : '') + commonParts.join('/');

    // Trivial LCA: root of filesystem or LCA equals one of the input paths
    if (lca === '/' || lca === '' || absoluteOutputPaths.some(p => p.replace(/\\/g, '/') === lca || p.replace(/\\/g, '/') === lca + '/')) {
        return null;
    }

    // Normalize to platform separator
    return lca.replace(/\//g, sep);
}
