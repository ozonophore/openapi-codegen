/**
 * True when a Canonical Ref Pointer names a Schema Object in the Schema registry.
 * Missing/empty Pointer means whole-file identity, which remains a Model.
 */
export function isSchemaRegistryPointer(pointer?: string): boolean {
    if (!pointer) {
        return true;
    }
    return pointer.startsWith('#/components/schemas/') || pointer.startsWith('#/definitions/');
}
