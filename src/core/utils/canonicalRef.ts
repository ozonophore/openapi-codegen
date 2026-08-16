export type CanonicalRefPair = {
    sourceFile: string;
    pointer?: string;
};

/**
 * Split a Canonical Ref into `(sourceFile, Pointer?)` before any path API.
 * Pointer includes the leading `#`. Absent for whole-file identity.
 */
export function splitCanonicalRef(ref: string): CanonicalRefPair {
    if (!ref) {
        return { sourceFile: '' };
    }
    if (ref.startsWith('#')) {
        return { sourceFile: '', pointer: ref };
    }
    const hashIndex = ref.indexOf('#');
    if (hashIndex === -1) {
        return { sourceFile: ref };
    }
    return {
        sourceFile: ref.slice(0, hashIndex),
        pointer: ref.slice(hashIndex),
    };
}

/** Rejoin only when calling `$Refs` (or otherwise serializing the identity). */
export function joinCanonicalRef({ sourceFile, pointer }: CanonicalRefPair): string {
    return pointer ? `${sourceFile}${pointer}` : sourceFile;
}

/**
 * Parent source file for `$ref` lookup: drop a leftover Pointer.
 * Lookup itself rejects `file#/Pointer` as parent.
 */
export function toParentSourceFile(parent: string | undefined): string | undefined {
    if (!parent) {
        return undefined;
    }
    return splitCanonicalRef(parent).sourceFile || undefined;
}

/**
 * Non-schema component registries (OAS3 + OAS2).
 * A Canonical Ref is a Model unless its Pointer starts with one of these.
 * Schema registry prefixes (`#/components/schemas/`, `#/definitions/`) must not appear here —
 * they are naming-only in stripNamespace.
 */
export const NON_MODEL_POINTER_PREFIXES = [
    '#/components/responses/',
    '#/components/parameters/',
    '#/components/headers/',
    '#/components/requestBodies/',
    '#/components/examples/',
    '#/components/securitySchemes/',
    '#/components/links/',
    '#/components/callbacks/',
    '#/components/pathItems/',
    '#/responses/',
    '#/parameters/',
    '#/securityDefinitions/',
] as const;

/**
 * True when an already-split Pointer names a Model.
 * Empty/missing Pointer means whole-file identity, which remains a Model.
 * Do not pass a serialized `file#pointer` — split first.
 */
export function isModelPointer(pointer?: string): boolean {
    if (!pointer) {
        return true;
    }
    return !NON_MODEL_POINTER_PREFIXES.some(prefix => pointer.startsWith(prefix));
}

/**
 * Convenience: split a serialized Canonical Ref, then apply `isModelPointer`.
 */
export function isModelCanonicalRef(canonicalRef: string): boolean {
    return isModelPointer(splitCanonicalRef(canonicalRef).pointer);
}
