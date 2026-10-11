import { sourceFileAfterRef } from '../utils/canonicalRef';

export type RefLookupHost = {
    get(ref: string, parentSourceFile?: string): unknown;
    toCanonicalRef(ref: string, parentSourceFile?: string): string;
};

export type Followed<T> = {
    value: T;
    parent: string;
};

/**
 * Follow after `$ref` lookup: dereference the node, then rebind Parent source file
 * to the Canonical Ref source file (or keep `parent` when that source file is empty).
 */
export function lookupAndFollow<T extends { $ref?: string }>(lookup: RefLookupHost, node: T, parent: string): Followed<T> {
    if (!node.$ref) {
        return { value: node, parent };
    }
    return {
        value: lookup.get(node.$ref, parent) as T,
        parent: sourceFileAfterRef(lookup.toCanonicalRef(node.$ref, parent), parent),
    };
}
