import { EVersionedSchemaType } from "../Enums";
import { SchemaMigrationPlan, VersionedSchema } from "../Types";
import { getUniqueAllShemasKeys } from "./getUniqueAllShemasKeys";
import { getUniqueObjectKeys } from "./getUniqueObjectKeys";
import { guessVersion } from "./guessVersion";
import { validateUnknownKeys } from "./validateUnknownKeys";

type MigrateToLatestProps = {
    rawInput: Record<string, any>;
    versionedSchemas: VersionedSchema<Record<string, any>>[];
    migrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[];
};

type MigrateToLatestResult = {
    value: Record<string, any>;
    schemaVersion: string;
    schemaType: EVersionedSchemaType;
}

export function migrateToLatestVersion({ rawInput, migrationPlans, versionedSchemas }: MigrateToLatestProps): MigrateToLatestResult | null {
    let currentData = rawInput;

    const allRawInputKeys = getUniqueObjectKeys(rawInput);
    const allSchemasKeys = getUniqueAllShemasKeys(versionedSchemas);

    validateUnknownKeys(allRawInputKeys, allSchemasKeys);

    const guessed = guessVersion(rawInput, versionedSchemas);

    for (let idx = guessed.index; idx < versionedSchemas.length - 1; idx++) {
        const fromVersion = versionedSchemas[idx].version;
        const migrationPlan = migrationPlans.find(p => p.fromVersion === fromVersion);

        if (!migrationPlan) {
            throw new Error(`No migration plan from ${fromVersion}`);
        }

        const migratedRaw = migrationPlan.migrate(currentData);
        const { error } = versionedSchemas[idx + 1].schema.validate(migratedRaw, { allowUnknown: false });
        if (error) {
            if (error) throw new Error(`Error during post-migration validation ${fromVersion}->${migrationPlan.toVersion}: ${error.message}`);
        }
        currentData = {...migratedRaw};
    }

    const currentSchema = versionedSchemas[versionedSchemas.length - 1];
    const { error, value } = currentSchema.schema.validate(currentData);
    if (error) return null;

    return { value, schemaVersion: currentSchema.version, schemaType: currentSchema.type };
}
