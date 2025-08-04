import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { EVersionedSchemaType } from '../VersionedSchema/Enums';
import { optionsMigrationPlans } from '../VersionedSchema/OptionsMigrationPlans';
import { optionsVersionedSchemas } from '../VersionedSchema/OptionsVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../VersionedSchema/Utils/migrateDataToLatestSchemaVersion';

describe('migrationForOptions', () => {
    test('@unit: must migrate data to the latest schema version', async () => {
        const input = { input: "input/path", output: "output/path", client: "fetch" };
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: optionsMigrationPlans,
            versionedSchemas: optionsVersionedSchemas,
        });
        assert.deepEqual(result, {
            value: { input: 'input/path', output: 'output/path', httpClient: 'fetch', useCancelableRequest: false },
            schemaVersion: '2.0.0',
            schemaType: EVersionedSchemaType.OPTIONS,
        });
    });

    test('@unit: should return null if the validation error occurred for the last schema.', async () => {
        const input = { input: "input/path", };
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: optionsMigrationPlans,
            versionedSchemas: optionsVersionedSchemas,
        });
        assert.equal(result, null);
    });

    test('@unit: It should throw an error if the migration plan is not found.', async () => {
        const input = { input: "input/path", output: "output/path", client: "fetch" };
        assert.throws(() => migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: [],
            versionedSchemas: optionsVersionedSchemas,
        }), /No migration plan from 1.0.0/);
    });
});
