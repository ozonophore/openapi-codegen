/**
 * Model identity: Pointer-prefix matcher against the Schema registry.
 * Whole-file Canonical Ref (no Pointer) is a Model.
 */
const SCHEMA_REGISTRY_POINTER_PREFIXES = ['#/components/schemas/', '#/definitions/'] as const;

export function isModelCanonicalRef(canonicalRef: string): boolean {
    const hashIndex = canonicalRef.indexOf('#');
    if (hashIndex === -1) {
        return true;
    }
    const pointer = canonicalRef.slice(hashIndex);
    return SCHEMA_REGISTRY_POINTER_PREFIXES.some(prefix => pointer.startsWith(prefix));
}
