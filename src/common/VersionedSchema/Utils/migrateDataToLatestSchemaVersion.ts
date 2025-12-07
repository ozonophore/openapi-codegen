import { EMigrationMode } from '../../Enums';
import { EVersionedSchemaType } from '../Enums';
import { SchemaMigrationPlan, VersionedSchema, VersionMatchResult } from '../Types';
import { determineBestMatchingSchemaVersion } from './determineBestMatchingSchemaVersion';
import { generateKeyMappingForInvalidKeys } from './generateKeyMappingForInvalidKeys';
import { getCurrentErrorMessage } from './getCurrentErrorMessage';
import { getUniqueKeysFromSchemas } from './getUniqueKeysFromSchemas';
import { getUniqueObjectKeys } from './getUniqueObjectKeys';
import { replaceInvalidKeysWithMappedNames } from './replaceInvalidKeysWithMappedNames';
import { validateAndSuggestKeyCorrections } from './validateAndSuggestKeyCorrections';

type MigrateToLatestProps = {
    rawInput: Record<string, any>;
    migrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[];
    versionedSchemas: VersionedSchema<Record<string, any>>[];
    migrationMode: EMigrationMode;
};

type MigrateToLatestResult = {
    value: Record<string, any>;
    guessedVersion: VersionMatchResult;
    schemaVersion: string;
    schemaType: EVersionedSchemaType;
};

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

    const actualVersionIndex = versionedSchemas.length - 1;
    const actualSchema = versionedSchemas[actualVersionIndex];

    for (let idx = guessedVersion.lastVersionIndex; idx < versionedSchemas.length - 1; idx++) {
        const { error: firstError } = versionedSchemas[idx].schema.validate(currentData);
        if (firstError) {
            getCurrentErrorMessage(firstError, replacingKeysMap);
        }

        const fromVersion = versionedSchemas[idx].version;
        const migrationPlan = migrationPlans.find(p => p.fromVersion === fromVersion);

        if (!migrationPlan) {
            throw new Error(`No migration plan from ${fromVersion}`);
        }

        const migratedRaw = migrationPlan.migrate(currentData);
        const { error } = versionedSchemas[idx + 1].schema.validate(migratedRaw, { allowUnknown: false });
        if (error) {
            throw new Error(error.message);
        }
        currentData = { ...migratedRaw };

        const isLastIteration = idx + 1 === actualVersionIndex;

        if (isLastIteration && migrationMode === EMigrationMode.GENERATE_OPENAPI) {
            console.warn(
                'Для выполнения генерации OpenApi потребовалось мигрировать схему Ваших данных на актуальную. Для обновленмя конфигурации в файле используйте команду `npm name_cli_tool update-config`'
            );
        }
    }

    const { error } = actualSchema.schema.validate(currentData, { allowUnknown: false });
    if (error) {
        getCurrentErrorMessage(error, replacingKeysMap);
    }

    return { value: currentData, guessedVersion, schemaVersion: actualSchema.version, schemaType: actualSchema.type };
}
