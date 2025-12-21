import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { EMigrationMode } from '../../Enums';
import { EVersionedSchemaType } from '../../VersionedSchema/Enums';
import { optionsMigrationPlans } from '../../VersionedSchema/OptionsVersioned/OptionsMigrationPlans';
import { optionsVersionedSchemas } from '../../VersionedSchema/OptionsVersioned/OptionsVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../VersionedSchema/Utils/migrateDataToLatestSchemaVersion';

describe('@unit: migrationForOptions', () => {
    test.skip('must migrate data to the latest schema version', async () => {
        const input = { input: 'input/path', output: 'output/path', client: 'fetch' };
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: optionsMigrationPlans,
            versionedSchemas: optionsVersionedSchemas,
            migrationMode: EMigrationMode.GENERATE_OPENAPI,
        });
        assert.deepEqual(result, {
            value: {
                excludeCoreServiceFiles: false,
                httpClient: 'fetch',
                includeSchemasFiles: false,
                input: 'input/path',
                output: 'output/path',
                sortByRequired: false,
                useCancelableRequest: false,
                useSeparatedIndexes: false,
            },
            schemaVersion: 'v4',
            schemaType: EVersionedSchemaType.OPTIONS,
        });
    });

    test.skip('should return null if the validation error occurred for the last schema.', async () => {
        const input = { input: 'input/path' };
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: optionsMigrationPlans,
            versionedSchemas: optionsVersionedSchemas,
            migrationMode: EMigrationMode.GENERATE_OPENAPI,
        });
        assert.equal(result, null);
    });

    test.skip('It should throw an error if the migration plan is not found.', async () => {
        const input = { input: 'input/path', output: 'output/path', client: 'fetch' };
        assert.throws(
            () =>
                migrateDataToLatestSchemaVersion({
                    rawInput: input,
                    migrationPlans: [],
                    versionedSchemas: optionsVersionedSchemas,
                    migrationMode: EMigrationMode.GENERATE_OPENAPI,
                }),
            /No migration plan from v1/
        );
    });
});
