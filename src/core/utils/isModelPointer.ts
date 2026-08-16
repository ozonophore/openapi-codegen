/**
 * Pointer prefixes that are never Models (OAS3 non-schema component registries
 * and OAS2 counterparts). Schema registries and schema-document Pointers
 * (`#/components/schemas/`, `#/definitions/`, `#/properties/…`) are Models
 * because they are not on this list.
 *
 * Shared with `stripNamespace` for naming only — do not use stripNamespace as
 * an is-Model check (it also strips Schema-registry prefixes).
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
 * True when a Canonical Ref Pointer names a Model.
 * Missing/empty Pointer means whole-file identity, which remains a Model.
 */
export function isModelPointer(pointer?: string): boolean {
    if (!pointer) {
        return true;
    }
    return !NON_MODEL_POINTER_PREFIXES.some(prefix => pointer.startsWith(prefix));
}
