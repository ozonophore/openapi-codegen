import { APP_LOGGER } from '../../../common/Consts';
import { EMigrationMode } from '../../../common/Enums';
import { LOGGER_MESSAGES } from '../../../common/LoggerMessages';
import { allVersionedSchemas } from '../../../common/VersionedSchema/AllVersionedSchemas/AllVersionedSchemas';
import { prepareAndMigrateLoadedConfig } from '../../../common/VersionedSchema/Utils/prepareAndMigrateLoadedConfig';
import { IConfigValidationResult } from '../types';
import { isDeepEqual, removeDefaultConfigValues } from './removeDefaultConfigValues';

/**
 * Валидирует и мигрирует данные конфигурации до UNIFIED v6 через общую цепочку `allMigrationPlans`.
 * @param configData данные конфигурации (объект или устаревший массив)
 * @returns результат с флагом актуальности версии, очищенными данными и признаком дефолтных значений
 * @throws Error если валидация или миграция не удалась
 *
 * @example
 * const result = validateAndMigrateConfigData(loadedConfig);
 * if (!result.isActualConfigVersion) {
 *   console.warn('Configuration version is outdated');
 * }
 */
export function validateAndMigrateConfigData(configData: Record<string, unknown> | Record<string, unknown>[]): IConfigValidationResult {
    const isArrayFormat = Array.isArray(configData);
    if (isArrayFormat) {
        APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.ARRAY_DEPRECATED);
    }

    const migrationResult = prepareAndMigrateLoadedConfig(configData, EMigrationMode.VALIDATE_CONFIG, { omitUndefined: true });
    if (!migrationResult) {
        throw new Error(LOGGER_MESSAGES.CONFIG.CONVERSION_FAILED);
    }

    const latestSchema = allVersionedSchemas[allVersionedSchemas.length - 1];

    const migratedData = migrationResult?.value ?? {};
    const dataWithoutDefaults = removeDefaultConfigValues(migratedData);
    const hasDefaultValues = !isDeepEqual(migratedData, dataWithoutDefaults);

    return {
        isActualConfigVersion: migrationResult.schemaVersion === latestSchema.version && !isArrayFormat,
        migratedData: dataWithoutDefaults,
        hasDefaultValues,
    };
}
