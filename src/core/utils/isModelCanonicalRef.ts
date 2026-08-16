/**
 * Pointer prefixes that name non-Schema OpenAPI components.
 * Catalog shared with stripNamespace; schema/definitions prefixes stay there only.
 * A Canonical Ref is a Model unless its Pointer starts with one of these.
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
    '#/responses/',
    '#/parameters/',
    '#/securityDefinitions/',
] as const;

/**
 * Model identity: denylist matcher against non-Schema component Pointers.
 * Whole-file Canonical Ref (no Pointer) is a Model.
 */
export function isModelCanonicalRef(canonicalRef: string): boolean {
    const hashIndex = canonicalRef.indexOf('#');
    if (hashIndex === -1) {
        return true;
    }
    const pointer = canonicalRef.slice(hashIndex);
    return !NON_MODEL_POINTER_PREFIXES.some(prefix => pointer.startsWith(prefix));
}
