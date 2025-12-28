import { SchemaMigrationPlan } from "../Types";

/**
 * Creates a simple migration plan that adds optional fields.
 * Use this when migration only adds optional fields.
 * @param fromVersion 
 * @param toVersion 
 * @param defaultFields 
 * @returns 
 */
export function createDefaultFieldsMigration<From extends Record<string, any>>(
    fromVersion: string, 
    toVersion: string,
    defaultFields: Record<string, any>
): SchemaMigrationPlan<From, From> {
    return {
        fromVersion,
        toVersion,
        migrate: (oldVersion) => ({ ...oldVersion, ...defaultFields }),
        description: `Adds default values for new optional fields: ${Object.keys(defaultFields).join(', ')}`,
    };
}