import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { EVersionedSchemaType } from '../VersionedSchema/Enums';
import { multiOptionsMigrationPlan } from '../VersionedSchema/MultiOptionsMigrationPlan';
import { multiOptionsVersionedSchema } from '../VersionedSchema/MultiOptionsVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import { mockJoiSchema } from './__mock__/mockJoiSchema';

describe('migrationForMultiOptions', () => {
    test('@unit: must successfully migrate MULTI_OPTIONS data to the latest version', async () => {
        const input = { input: 'input/path', output: 'output/path', client: 'fetch', items: [{ input: 'path/item1' }] };
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: multiOptionsMigrationPlan,
            versionedSchemas: multiOptionsVersionedSchema,
        });

        assert.deepEqual(result, {
            value: {
                httpClient: 'fetch',
                useCancelableRequest: false,
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
            },
            schemaVersion: '2.0.0',
            schemaType: EVersionedSchemaType.MULTI_OPTIONS,
        });
    });

    test('@unit: should return null in case of validation error of the last MULTI_OPTIONS scheme', async () => {
        const input = { input: 'input/path' };
        const result = migrateDataToLatestSchemaVersion({
            rawInput: input,
            migrationPlans: multiOptionsMigrationPlan,
            versionedSchemas: multiOptionsVersionedSchema,
        });

        assert.equal(result, null);
    });

    test('@unit: should throw an error if the migration plan for MULTI_OPTIONS is not found.', async () => {
        const input = { input: 'input/path', output: 'output/path', client: 'fetch', items: [{ input: 'path/item1' }] };

        assert.throws(
            () =>
                migrateDataToLatestSchemaVersion({
                    rawInput: input,
                    migrationPlans: [],
                    versionedSchemas: multiOptionsVersionedSchema,
                }),
            /No migration plan from 1.0.0/
        );
    });

    test('@unit: should throw an error on unrecognized fields in MULTI_OPTIONS', async () => {
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
                }),
            /The "name" field is not recognized./
        );
    });

    test('@unit: must process an empty array of MULTI_OPTIONS data', async () => {
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
        });

        assert.deepEqual(result, {
            value: [],
            schemaVersion: '2.0',
            schemaType: EVersionedSchemaType.MULTI_OPTIONS,
        });
    });
});
