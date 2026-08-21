import { EMigrationMode } from '../../Enums';
import { allMigrationPlans } from '../AllVersionedSchemas/AllMigrationPlans';
import { allVersionedSchemas } from '../AllVersionedSchemas/AllVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from './migrateDataToLatestSchemaVersion';

/**
 * Migrate a prepared config record to the latest schema using default plans/schemas.
 * Callers MUST prep input first (`convertArrayToObject`, optional `omitUndefined`).
 */
export function migrateLoadedConfigToLatest(rawInput: Record<string, any>, migrationMode: EMigrationMode) {
    return migrateDataToLatestSchemaVersion({
        rawInput,
        migrationPlans: allMigrationPlans,
        versionedSchemas: allVersionedSchemas,
        migrationMode,
    });
}
