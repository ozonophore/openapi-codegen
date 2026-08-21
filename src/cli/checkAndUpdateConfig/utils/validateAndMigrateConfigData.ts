import { APP_LOGGER } from '../../../common/Consts';
import { EMigrationMode } from '../../../common/Enums';
import { LOGGER_MESSAGES } from '../../../common/LoggerMessages';
import { convertArrayToObject } from '../../../common/utils/convertArrayToObject';
import { allVersionedSchemas } from '../../../common/VersionedSchema/AllVersionedSchemas/AllVersionedSchemas';
import { migrateLoadedConfigToLatest } from '../../../common/VersionedSchema/Utils/migrateLoadedConfigToLatest';
import { IConfigValidationResult } from '../types';
import { isDeepEqual, removeDefaultConfigValues } from './removeDefaultConfigValues';

const omitUndefinedValues = (data: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
            continue;
        }

        if (Array.isArray(value)) {
            result[key] = value.map(item => (item && typeof item === 'object' && !Array.isArray(item) ? omitUndefinedValues(item as Record<string, unknown>) : item));
            continue;
        }

        if (value && typeof value === 'object') {
            result[key] = omitUndefinedValues(value as Record<string, unknown>);
            continue;
        }

        result[key] = value;
    }

    return result;
};

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

    const normalizedData = omitUndefinedValues(convertArrayToObject(configData));

    const migrationResult = migrateLoadedConfigToLatest(normalizedData, EMigrationMode.VALIDATE_CONFIG);
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
