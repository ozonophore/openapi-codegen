import { SchemaMigrationPlan } from '../Types';

/**
 * Creates a trivial migration plan that just copies all fields.
 * Use this when migration only adds doesn't require transformation.
 */
export function createTrivialMigration<From extends Record<string, any>>(
    fromVersion: string,
    toVersion: string,
    description?: string
): SchemaMigrationPlan<From, From> {
    return {
        fromVersion,
        toVersion,
        migrate: (oldVersion) => ({ ...oldVersion }),
        description: description || 'Trivial migration that copies all fields without changes',
    };
}
