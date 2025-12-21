import { EMigrationMode } from '../../../common/Enums';
import { convertArrayToObject } from '../../../common/utils/convertArrayToObject';
import { multiOptionsMigrationPlan } from '../../../common/VersionedSchema/MultiOptionsVersioned/MultiOptionsMigrationPlan';
import { multiOptionsVersionedSchema } from '../../../common/VersionedSchema/MultiOptionsVersioned/MultiOptionsVersionedSchemas';
import { optionsMigrationPlans } from '../../../common/VersionedSchema/OptionsVersioned/OptionsMigrationPlans';
import { optionsVersionedSchemas } from '../../../common/VersionedSchema/OptionsVersioned/OptionsVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../../common/VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import { isInstanceOfMultioptions } from '../../../core/utils/isInstanceOfMultiOptions';
import { IConfigValidationResult } from '../types';
import { removeDefaultConfigValues } from './removeDefaultConfigValues';

/**
 * Валидирует и мигрирует данные конфигурации до последней версии схемы.
 * Определяет тип конфигурации (одиночная или множественная опция) и применяет соответствующий план миграции.
 *
 * @param configData - Данные конфигурации (объект или массив)
 * @returns Результат валидации с информацией о версии и наличии значений по умолчанию
 * @throws {Error} Если валидация или миграция не удалась
 *
 * @example
 * const result = validateAndMigrateConfigData(loadedConfig);
 * if (!result.isActualConfigVersion) {
 *   console.warn('Configuration version is outdated');
 * }
 */
export function validateAndMigrateConfigData(
    configData: Record<string, any> | Record<string, any>[]
): IConfigValidationResult {
    const isArrayFormat = Array.isArray(configData);
    const normalizedData = convertArrayToObject(configData);
    const isMultiOptions = isInstanceOfMultioptions(normalizedData);

    // Выбрать соответствующие схемы и планы миграции
    const migrationPlans = isMultiOptions ? multiOptionsMigrationPlan : optionsMigrationPlans;
    const versionedSchemas = isMultiOptions ? multiOptionsVersionedSchema : optionsVersionedSchemas;

    // Выполнить миграцию
    const migrationResult = migrateDataToLatestSchemaVersion({
        rawInput: normalizedData,
        migrationPlans,
        versionedSchemas,
        migrationMode: EMigrationMode.VALIDATE_CONFIG,
    });

    // Получить последнюю версию схемы
    const latestSchema = versionedSchemas[versionedSchemas.length - 1];
    const currentVersion = migrationResult?.guessedVersion?.latestVersion;

    // Проверить наличие значений по умолчанию
    const migratedData = migrationResult?.value ?? {};
    const dataWithoutDefaults = removeDefaultConfigValues(migratedData);
    const hasDefaultValues = Object.keys(dataWithoutDefaults).length !== Object.keys(migratedData).length;

    return {
        isActualConfigVersion: currentVersion === latestSchema.version && !isArrayFormat,
        migratedData: dataWithoutDefaults,
        hasDefaultValues,
    };
}
