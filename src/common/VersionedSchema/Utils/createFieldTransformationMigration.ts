import { SchemaMigrationPlan } from '../Types';

/**
 * Creates a migration plan that transforms fields using a custom migration function.
 * Use this for migrations that require field renaming, restructuring, or complex transformations
 * that cannot be handled by createDefaultFieldsMigration or createTrivialMigration.
 * 
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @param migrate - Custom migration function that transforms the data
 * @param description - Optional description of what this migration does
 * @returns A migration plan with the custom transformation
 * 
 * @example
 * ```ts
 * // Rename field: client -> httpClient
 * createFieldTransformationMigration('v1', 'v2', 
 *   ({ client, ...otherProps }) => ({ ...otherProps, httpClient: client }),
 *   'Renames client field to httpClient'
 * )
 * 
 * // Transform items array
 * createFieldTransformationMigration('v3', 'v4',
 *   ({ items, input, output, ...otherProps }) => ({
 *     ...otherProps,
 *     items: items.map(el => ({ ...el, input, output }))
 *   }),
 *   'Moves input/output fields into each item'
 * )
 * ```
 */
export function createFieldTransformationMigration<From extends Record<string, any>, To extends Record<string, any>>(
    fromVersion: string,
    toVersion: string,
    migrate: (input: From) => To,
    description?: string
): SchemaMigrationPlan<From, To> {
    return {
        fromVersion,
        toVersion,
        migrate,
        description: description || `Custom field transformation migration from ${fromVersion} to ${toVersion}`,
    };
}
