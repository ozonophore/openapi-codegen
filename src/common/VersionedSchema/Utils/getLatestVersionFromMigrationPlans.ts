import { SchemaMigrationPlan } from '../Types';

/**
 * Gets the latest version from a migration plans array.
 * Returns the `toVersion` of the last migration plan in the array.
 * 
 * @param migrationPlans - Array of migration plans
 * @returns The latest version string (e.g., 'v4')
 * 
 * @example
 * ```ts
 * const latestVersion = getLatestVersionFromMigrationPlans(optionsMigrationPlans);
 * // Returns 'v4'
 * ```
 */
export function getLatestVersionFromMigrationPlans(
    migrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[]
): string {
    if (migrationPlans.length === 0) {
        throw new Error('Migration plans array is empty. Cannot determine latest version.');
    }
    
    const lastPlan = migrationPlans[migrationPlans.length - 1];
    return lastPlan.toVersion;
}
