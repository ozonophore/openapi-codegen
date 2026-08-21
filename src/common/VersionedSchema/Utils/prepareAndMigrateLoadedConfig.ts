import { EMigrationMode } from '../../Enums';
import { convertArrayToObject } from '../../utils/convertArrayToObject';
import { omitUndefinedValues } from '../../utils/omitUndefinedValues';
import { migrateLoadedConfigToLatest } from './migrateLoadedConfigToLatest';

export type PrepareAndMigrateLoadedConfigOptions = {
    /** When true, deep-omit `undefined` after array→object convert (check/update-config path). */
    omitUndefined?: boolean;
};

/**
 * Prep loaded config (object or legacy array) then migrate with default plans/schemas.
 */
export function prepareAndMigrateLoadedConfig(configData: Record<string, unknown> | Record<string, unknown>[], migrationMode: EMigrationMode, options: PrepareAndMigrateLoadedConfigOptions = {}) {
    let prepared: Record<string, any> = convertArrayToObject(configData);
    if (options.omitUndefined) {
        prepared = omitUndefinedValues(prepared);
    }
    return migrateLoadedConfigToLatest(prepared, migrationMode);
}
