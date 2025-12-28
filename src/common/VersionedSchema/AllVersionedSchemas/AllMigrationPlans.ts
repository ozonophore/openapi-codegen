import { multiOptionsMigrationPlan } from '../MultiOptionsVersioned/MultiOptionsMigrationPlan';
import { optionsMigrationPlans } from '../OptionsVersioned/OptionsMigrationPlans';
import { SchemaMigrationPlan } from '../Types';
import { createTrivialMigration } from '../Utils/createTrivialMigration';

/**
 * Adds a prefix to all version strings in a migration plan array.
 */
function addVersionPrefixToMigrationPlans(plans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[], prefix: string): SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] {
    return plans.map(plan => ({
        ...plan,
        fromVersion: `${prefix}_${plan.fromVersion}`,
        toVersion: `${prefix}_${plan.toVersion}`,
    }));
}

/**
 * Unified migration plan that includes all migrations from all schema types.
 * Migrates from any old version to the latest UNIFIED_v1 schema.
 * Reuses existing migration plans to avoid code duplication.
 */
export const allMigrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [
    // ===== OPTIONS migrations (with prefix) =====
    ...addVersionPrefixToMigrationPlans(optionsMigrationPlans, 'OPTIONS'),

    // Migration from OPTIONS v4 to UNIFIED v1
    createTrivialMigration('OPTIONS_v4', 'UNIFIED_v1', 'Migrate from OPTIONS to UNIFIED schema'),

    // ===== MULTI_OPTIONS migrations (with prefix) =====
    ...addVersionPrefixToMigrationPlans(multiOptionsMigrationPlan, 'MULTI_OPTIONS'),

    // Migration from MULTI_OPTIONS v5 to UNIFIED v1
    createTrivialMigration('MULTI_OPTIONS_v5', 'UNIFIED_v1', 'Migrate from MULTI_OPTIONS to UNIFIED schema'),
];
