import { z } from 'zod';

import { EMigrationMode } from '../../Enums';
import { validateZodOptions, validateZodOptionsRaw } from '../../Validation/validateZodOptions';
import { EVersionedSchemaType } from '../Enums';
import { SchemaMigrationPlan, VersionedSchema, VersionMatchResult } from '../Types';
import { determineBestMatchingSchemaVersion } from './determineBestMatchingSchemaVersion';
import { generateKeyMappingForInvalidKeys } from './generateKeyMappingForInvalidKeys';
import { getCurrentErrorMessage } from './getCurrentErrorMessage';
import { getUniqueKeysFromSchemas } from './getUniqueKeysFromSchemas';
import { getUniqueObjectKeys } from './getUniqueObjectKeys';
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
 * Migrates raw input through the migration graph to the latest schema version.
 * Migration path is resolved by `fromVersion -> toVersion` links from `migrationPlans`.
 */
export function migrateDataToLatestSchemaVersion({ rawInput, migrationPlans, versionedSchemas, migrationMode }: MigrateToLatestProps): MigrateToLatestResult | null {
    const schemas = versionedSchemas.map(el => el.schema);
    const allUniqueKeysFromSchemas = getUniqueKeysFromSchemas(schemas);
    const allUniqueKeysFromRawInput = getUniqueObjectKeys(rawInput);

    validateAndSuggestKeyCorrections(allUniqueKeysFromRawInput, allUniqueKeysFromSchemas);

    const guessedVersion = determineBestMatchingSchemaVersion(rawInput, versionedSchemas);
    const guessedValidationSchema = schemas[guessedVersion.lastVersionIndex];

    const schemaPossibleKeys = getUniqueKeysFromSchemas([guessedValidationSchema]);
    const replacingKeysMap = generateKeyMappingForInvalidKeys(allUniqueKeysFromRawInput, schemaPossibleKeys);

    let currentData = replacingKeysMap.size ? replaceInvalidKeysWithMappedNames(rawInput, replacingKeysMap) : rawInput;

    const actualSchema = versionedSchemas[versionedSchemas.length - 1];
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
            throw new Error(
                `No migration plan from ${currentVersion}. ` +
                `Available migration plans: ${availableVersions}. ` +
                `This usually means the migration chain is incomplete.`
            );
        }

        const nextVersion = migrationPlan.toVersion;
        const nextSchema = schemasByVersion.get(nextVersion);
        if (!nextSchema) {
            throw new Error(
                `Migration plan from ${migrationPlan.fromVersion} points to unknown schema version ${nextVersion}.`
            );
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
            console.warn(
                'Для выполнения генерации OpenApi потребовалось мигрировать схему Ваших данных на актуальную. Для обновленмя конфигурации в файле используйте команду `npm name_cli_tool update-config`'
            );
        }
    }

    const validationResult = validateZodOptionsRaw(actualSchema.schema, currentData);
    if (!validationResult.success) {
        getCurrentErrorMessage(validationResult.error, replacingKeysMap);
    }

    return { value: currentData, guessedVersion, schemaVersion: actualSchema.version, schemaType: actualSchema.type };
}
