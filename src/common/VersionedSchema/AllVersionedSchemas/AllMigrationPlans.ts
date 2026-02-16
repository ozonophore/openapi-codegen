import { EmptySchemaStrategy } from '../../../core/types/enums/EmptySchemaStrategy.enum';
import { ValidationLibrary } from '../../../core/types/enums/ValidationLibrary.enum';
import { ELogLevel, ELogOutput } from '../../Enums';
import { multiOptionsMigrationPlan } from '../MultiOptionsVersioned/MultiOptionsMigrationPlan';
import { optionsMigrationPlans } from '../OptionsVersioned/OptionsMigrationPlans';
import { SchemaMigrationPlan } from '../Types';
import { createDefaultFieldsMigration } from '../Utils/createDefaultFieldsMigration';
import { createFieldTransformationMigration } from '../Utils/createFieldTransformationMigration';
import { createTrivialMigration } from '../Utils/createTrivialMigration';
import { getLatestVersionFromMigrationPlans } from '../Utils/getLatestVersionFromMigrationPlans';

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
 * Migrates from any old version to the latest UNIFIED_OPTIONS_v1 schema.
 * Reuses existing migration plans to avoid code duplication.
 */
export const allMigrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [
    // ===== OPTIONS migrations (with prefix) =====
    ...addVersionPrefixToMigrationPlans(optionsMigrationPlans, 'OPTIONS'),

    // Migration from OPTIONS latest version to UNIFIED v1
    createTrivialMigration(
        `OPTIONS_${getLatestVersionFromMigrationPlans(optionsMigrationPlans)}`,
        'UNIFIED_OPTIONS_v1',
        'Migrate from OPTIONS to UNIFIED schema'
    ),

    // ===== MULTI_OPTIONS migrations (with prefix) =====
    ...addVersionPrefixToMigrationPlans(multiOptionsMigrationPlan, 'MULTI_OPTIONS'),

    // Migration from MULTI_OPTIONS latest version to UNIFIED v1
    createTrivialMigration(
        `MULTI_OPTIONS_${getLatestVersionFromMigrationPlans(multiOptionsMigrationPlan)}`,
        'UNIFIED_OPTIONS_v1',
        'Migrate from MULTI_OPTIONS to UNIFIED schema'
    ),
    createFieldTransformationMigration(
        'UNIFIED_OPTIONS_v1',
        'UNIFIED_OPTIONS_v2',
        ({ includeSchemasFiles, ...otherProps }) => {
            return { ...otherProps, validationLibrary: !includeSchemasFiles ? ValidationLibrary.NONE : undefined };
        },
        'Transforms includeSchemasFiles to validationLibrary: if includeSchemasFiles is false, sets validationLibrary to NONE'
    ),
    createDefaultFieldsMigration(
        'UNIFIED_OPTIONS_v2',
        'UNIFIED_OPTIONS_v3',
        {
            logLevel: ELogLevel.ERROR,
            logTarget: ELogOutput.CONSOLE
        }
    ),
    createDefaultFieldsMigration(
        'UNIFIED_OPTIONS_v3',
        'UNIFIED_OPTIONS_v4',
        {
            emptySchemaStrategy: EmptySchemaStrategy.KEEP
        }
    )
];
