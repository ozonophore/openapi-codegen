import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { EMigrationMode } from '../../Enums';
import { EVersionedSchemaType } from '../../VersionedSchema/Enums';
import { multiOptionsMigrationPlan } from '../../VersionedSchema/MultiOptionsVersioned/MultiOptionsMigrationPlan';
import { multiOptionsVersionedSchema } from '../../VersionedSchema/MultiOptionsVersioned/MultiOptionsVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import { mockJoiSchema } from './__mock__/mockJoiSchema';

describe('@unit: migrationForMultiOptions', () => {
    test.skip('must successfully migrate MULTI_OPTIONS data to the latest version', async () => {
        const input = { input: 'input/path', output: 'output/path', client: 'fetch', items: [{ input: 'path/item1' }] };
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: multiOptionsMigrationPlan,
            versionedSchemas: multiOptionsVersionedSchema,
            migrationMode: EMigrationMode.GENERATE_OPENAPI,
        });

        assert.deepEqual(result, {
            value: {
                excludeCoreServiceFiles: false,
                httpClient: 'fetch',
                includeSchemasFiles: false,
                items: [
                    {
                        input: 'input/path',
                        output: 'output/path',
                        outputCore: undefined,
                        outputModels: undefined,
                        outputSchemas: undefined,
                        outputServices: undefined,
                    },
                ],
                sortByRequired: false,
                useCancelableRequest: false,
                useSeparatedIndexes: false,
            },
            schemaVersion: 'v5',
            schemaType: EVersionedSchemaType.MULTI_OPTIONS,
        });
    });

    test.skip('should return null in case of validation error of the last MULTI_OPTIONS scheme', async () => {
        const input = { input: 'input/path' };
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: multiOptionsMigrationPlan,
            versionedSchemas: multiOptionsVersionedSchema,
            migrationMode: EMigrationMode.GENERATE_OPENAPI,
        });

        assert.equal(result, null);
    });

    test.skip('should throw an error if the migration plan for MULTI_OPTIONS is not found.', async () => {
        const input = { input: 'input/path', output: 'output/path', client: 'fetch', items: [{ input: 'path/item1' }] };

        assert.throws(
            () =>
                migrateDataToLatestSchemaVersion({
                    rawInput: input,
                    migrationPlans: [],
                    versionedSchemas: multiOptionsVersionedSchema,
                    migrationMode: EMigrationMode.GENERATE_OPENAPI,
                }),
            /No migration plan from v1/
        );
    });

    test.skip('should throw an error on unrecognized fields in MULTI_OPTIONS', async () => {
        const input = {
            input: 'input/path',
            output: 'output/path',
            client: 'fetch',
            items: [{ input: 'path/item1', name: 'Item1' }],
        };

        assert.throws(
            () =>
                migrateDataToLatestSchemaVersion({
                    rawInput: input,
                    migrationPlans: multiOptionsMigrationPlan,
                    versionedSchemas: multiOptionsVersionedSchema,
                    migrationMode: EMigrationMode.GENERATE_OPENAPI,
                }),
            /The "name" field is not recognized./
        );
    });

    test.skip('must process an empty array of MULTI_OPTIONS data', async () => {
        const schemas = [
            {
                schema: mockJoiSchema(['name'], true, [], true),
                version: '1.0',
                type: EVersionedSchemaType.MULTI_OPTIONS,
            },
            {
                schema: mockJoiSchema(['name', 'options'], true, [], true),
                version: '2.0',
                type: EVersionedSchemaType.MULTI_OPTIONS,
            },
        ];
        const migrationPlans = [
            {
                fromVersion: '1.0',
                toVersion: '2.0',
                migrate: (input: any) => input.map((item: any) => ({ ...item, options: [] })),
            },
        ];
        const input: any[] = [];
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans,
            versionedSchemas: schemas as any,
            migrationMode: EMigrationMode.GENERATE_OPENAPI,
        });

        assert.deepEqual(result, {
            value: [],
            schemaVersion: '2.0',
            schemaType: EVersionedSchemaType.MULTI_OPTIONS,
        });
    });
});
