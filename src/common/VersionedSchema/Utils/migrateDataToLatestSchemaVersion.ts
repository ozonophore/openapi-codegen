import { z } from 'zod';

import { APP_LOGGER } from '../../Consts';
import { EMigrationMode } from '../../Enums';
import { LOGGER_MESSAGES } from '../../LoggerMessages';
import { validateZodOptions, validateZodOptionsRaw } from '../../Validation';
import { EVersionedSchemaType } from '../Enums';
import { SchemaMigrationPlan, VersionedSchema, VersionMatchResult } from '../Types';
import { applyKnownConfigKeyAliases } from './applyKnownConfigKeyAliases';
import { determineBestMatchingSchemaVersion } from './determineBestMatchingSchemaVersion';
import { generateKeyMappingForInvalidKeys } from './generateKeyMappingForInvalidKeys';
import { getCurrentErrorMessage } from './getCurrentErrorMessage';
import { getUniqueKeysFromSchemas } from './getUniqueKeysFromSchemas';
import { hasMarauderShapedKeys } from './hasMarauderShapedKeys';
import { normalizeMarauderConfigBlocks } from './normalizeMarauderConfigBlocks';
import { replaceInvalidKeysWithMappedNames } from './replaceInvalidKeysWithMappedNames';
import { validateAndSuggestKeyCorrections } from './validateAndSuggestKeyCorrections';

/**
 * Input arguments for migrating arbitrary config data to the latest schema version.
 */
type MigrateToLatestProps = {
    rawInput: Record<string, any>;
    migrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[];
    versionedSchemas: VersionedSchema<z.ZodTypeAny>[];
    migrationMode: EMigrationMode;
};

/**
 * Result of successful migration to the latest schema.
 */
type MigrateToLatestResult = {
    value: Record<string, any>;
    guessedVersion: VersionMatchResult;
    schemaVersion: string;
    schemaType: EVersionedSchemaType;
};

/**
 * Мигрирует сырые данные конфигурации до последней версии схемы.
 * Путь миграции определяется связями `fromVersion → toVersion` из `migrationPlans`.
 *
 * Для проверки опечаток и автозамены ключей используются только ключи верхнего уровня
 * (`Object.keys`), а не `getUniqueObjectKeys`: последний рекурсивно собирает имена
 * вложенных полей (`enabled`, `severity` внутри `autoSelect` и т.д.), из‑за чего
 * V6-конфиги с Marauder-блоками ложно отклонялись как «неизвестные поля».
 * Вложенная структура проверяется Zod при пошаговой миграции.
 *
 * @param rawInput исходные данные конфигурации
 * @param migrationPlans цепочка планов миграции между версиями
 * @param versionedSchemas все версии схем для сопоставления и валидации
 * @param migrationMode режим миграции (generate, validate-config и др.)
 * @returns результат миграции или null, если вход пуст
 */
export function migrateDataToLatestSchemaVersion({ rawInput, migrationPlans, versionedSchemas, migrationMode }: MigrateToLatestProps): MigrateToLatestResult | null {
    const aliasedInput = applyKnownConfigKeyAliases(rawInput);
    const schemas = versionedSchemas.map(el => el.schema);
    const allUniqueKeysFromSchemas = getUniqueKeysFromSchemas(schemas);
    const topLevelInputKeys = Object.keys(aliasedInput);

    validateAndSuggestKeyCorrections(topLevelInputKeys, allUniqueKeysFromSchemas);

    const guessedVersion = determineBestMatchingSchemaVersion(aliasedInput, versionedSchemas);
    const guessedValidationSchema = schemas[guessedVersion.lastVersionIndex];

    const schemaPossibleKeys = getUniqueKeysFromSchemas([guessedValidationSchema]);
    const replacingKeysMap = generateKeyMappingForInvalidKeys(topLevelInputKeys, schemaPossibleKeys);

    let currentData = replacingKeysMap.size ? replaceInvalidKeysWithMappedNames(aliasedInput, replacingKeysMap) : aliasedInput;

    const actualSchema = versionedSchemas[versionedSchemas.length - 1];

    if (hasMarauderShapedKeys(currentData) && guessedVersion.latestVersion !== actualSchema.version) {
        const latestValidationResult = validateZodOptionsRaw(actualSchema.schema, currentData);
        if (!latestValidationResult.success) {
            getCurrentErrorMessage(latestValidationResult.error, replacingKeysMap);
        }
    }

    const schemasByVersion = new Map(versionedSchemas.map(schemaInfo => [schemaInfo.version, schemaInfo.schema]));
    const migrationPlanByFromVersion = new Map(migrationPlans.map(plan => [plan.fromVersion, plan]));

    let currentVersion = guessedVersion.latestVersion;
    const visitedVersions = new Set<string>([currentVersion]);

    while (currentVersion !== actualSchema.version) {
        const currentVersionSchema = schemasByVersion.get(currentVersion);
        if (!currentVersionSchema) {
            throw new Error(`No schema found for version ${currentVersion}.`);
        }

        const firstValidationResult = validateZodOptionsRaw(currentVersionSchema, currentData);
        if (!firstValidationResult.success) {
            getCurrentErrorMessage(firstValidationResult.error, replacingKeysMap);
        }

        const migrationPlan = migrationPlanByFromVersion.get(currentVersion);

        if (!migrationPlan) {
            const availableVersions = Array.from(migrationPlanByFromVersion.keys()).join(', ');
            throw new Error(`No migration plan from ${currentVersion}. ` + `Available migration plans: ${availableVersions}. ` + `This usually means the migration chain is incomplete.`);
        }

        const nextVersion = migrationPlan.toVersion;
        const nextSchema = schemasByVersion.get(nextVersion);
        if (!nextSchema) {
            throw new Error(`Migration plan from ${migrationPlan.fromVersion} points to unknown schema version ${nextVersion}.`);
        }

        const migratedRaw = migrationPlan.migrate(currentData);

        const validationResult = validateZodOptions(nextSchema, migratedRaw);
        if (!validationResult.success) {
            throw new Error(
                `Migration from ${currentVersion} to ${nextVersion} failed validation. ` +
                    `Error: ${validationResult.errors.join('\n')}. ` +
                    `Migration description: ${migrationPlan.description || 'No description provided'}.`
            );
        }

        currentData = { ...migratedRaw };
        currentVersion = nextVersion;

        if (visitedVersions.has(currentVersion)) {
            throw new Error(`Migration loop detected at version ${currentVersion}.`);
        }
        visitedVersions.add(currentVersion);

        if (currentVersion === actualSchema.version && migrationMode === EMigrationMode.GENERATE_OPENAPI) {
            APP_LOGGER.warn(LOGGER_MESSAGES.MIGRATION.OPENAPI_SCHEMA_MIGRATED);
        }
    }

    currentData = normalizeMarauderConfigBlocks(currentData);

    const validationResult = validateZodOptionsRaw(actualSchema.schema, currentData);
    if (!validationResult.success) {
        getCurrentErrorMessage(validationResult.error, replacingKeysMap);
    }

    return { value: currentData, guessedVersion, schemaVersion: actualSchema.version, schemaType: actualSchema.type };
}
