import { EVersionedSchemaType } from '../Enums';
import { SchemaMigrationPlan, VersionedSchema } from '../Types';
import { determineBestMatchingSchemaVersion } from './determineBestMatchingSchemaVersion';
import { generateKeyMappingForInvalidKeys } from './generateKeyMappingForInvalidKeys';
import { getUniqueKeysFromSchemas } from './getUniqueKeysFromSchemas';
import { getUniqueObjectKeys } from './getUniqueObjectKeys';
import { replaceInvalidKeysWithMappedNames } from './replaceInvalidKeysWithMappedNames';
import { validateAndSuggestKeyCorrections } from './validateAndSuggestKeyCorrections';

type MigrateToLatestProps = {
    rawInput: Record<string, any>;
    migrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[];
    versionedSchemas: VersionedSchema<Record<string, any>>[];
};

type MigrateToLatestResult = {
    value: Record<string, any>;
    schemaVersion: string;
    schemaType: EVersionedSchemaType;
};

export function migrateDataToLatestSchemaVersion({ rawInput, migrationPlans, versionedSchemas }: MigrateToLatestProps): MigrateToLatestResult | null {
    const schemas = versionedSchemas.map(el => el.schema);
    const allUniqueKeysFromSchemas = getUniqueKeysFromSchemas(schemas);
    const allUniqueKeysFromRawInput = getUniqueObjectKeys(rawInput);

    validateAndSuggestKeyCorrections(allUniqueKeysFromRawInput, allUniqueKeysFromSchemas);

    const guessedVersion = determineBestMatchingSchemaVersion(rawInput, versionedSchemas);
    const guessedValidationSchema = schemas[guessedVersion.lastVersionIndex];

    const schemaPossibleKeys = getUniqueKeysFromSchemas([guessedValidationSchema]);
    const replacingKeysMap = generateKeyMappingForInvalidKeys(allUniqueKeysFromRawInput, schemaPossibleKeys);

    let currentData = replacingKeysMap.size ? replaceInvalidKeysWithMappedNames(rawInput, replacingKeysMap) : rawInput;

    for (let idx = guessedVersion.lastVersionIndex; idx < versionedSchemas.length - 1; idx++) {
        const fromVersion = versionedSchemas[idx].version;
        const migrationPlan = migrationPlans.find(p => p.fromVersion === fromVersion);

        if (!migrationPlan) {
            throw new Error(`No migration plan from ${fromVersion}`);
        }

        try {
            const migratedRaw = migrationPlan.migrate(currentData);
            const { error } = versionedSchemas[idx + 1].schema.validate(migratedRaw, { allowUnknown: false });
            if (error) {
                throw new Error(`Error during post-migration validation ${fromVersion}->${migrationPlan.toVersion}: ${error.message}`);
            }
            currentData = { ...migratedRaw };
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    const currentSchema = versionedSchemas[versionedSchemas.length - 1];
    const { error, value } = currentSchema.schema.validate(currentData, { allowUnknown: false });
    if (error) return null;

    return { value, schemaVersion: currentSchema.version, schemaType: currentSchema.type };
}
