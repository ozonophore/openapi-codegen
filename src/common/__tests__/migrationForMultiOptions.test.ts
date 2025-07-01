import assert from 'node:assert';
import { describe, test } from 'node:test';

import { multiOptionsMigrationPlan } from 'common/VersionedSchema/MultiOptionsMigrationPlan';
import { multiOptionsVersionedSchema } from 'common/VersionedSchema/MultiOptionsVersionedSchemas';

import { HttpClient } from '../../core';
import { EVersionedSchemaType } from '../VersionedSchema/Enums';
import { migrateToLatestVersion } from '../VersionedSchema/Utils/migrateToLatestVersion';

describe('migrateToLatestVersion for Multioptions', () => {
    test.skip('@unit: should migrate Multioptions data from 1.0.0 to 2.0.0', () => {
        const dataMultiV1 = {
            input: 'source/path',
            output: 'generated/path',
            client: HttpClient.AXIOS,
            items: [{ input: 'item1',output: 'generated/path', }, { input: 'item2',output: 'generated/path', }],
        };
        const expectedDataMultiV3 = {
            input: 'source/path',
            httpClient: HttpClient.AXIOS,
            items: [{ input: 'item1' }, { input: 'item2' }],
            useCancelableRequest: false,
        };

        const result = migrateToLatestVersion({
            rawInput: dataMultiV1,
            versionedSchemas: multiOptionsVersionedSchema,
            migrationPlans: multiOptionsMigrationPlan,
        });

        assert.deepEqual(result, { value: expectedDataMultiV3, schemaVersion: '2.0.0', schemaType: EVersionedSchemaType.MULTI_OPTIONS }, 'Should migrate Multioptions V1 data to V3 correctly');
    });

    test.skip('@unit: should migrate Multioptions data from 1.0.1 to 2.0.0', () => {
        const dataMultiV2 = {
            input: 'source/path',
            output: 'generated/path',
            httpClient: HttpClient.FETCH,
            items: [{ input: 'item1' }, { input: 'item2' }],
        };
        const expectedDataMultiV3 = {
            httpClient: HttpClient.FETCH,
            items: [{ input: 'item1', output: 'generated/path', }, { input: 'item2', output: 'generated/path' }],
        };

        const result = migrateToLatestVersion({
            rawInput: dataMultiV2,
            versionedSchemas: multiOptionsVersionedSchema,
            migrationPlans: multiOptionsMigrationPlan,
        });

        assert.deepEqual(result, { value: expectedDataMultiV3, schemaVersion: '2.0.0', schemaType: EVersionedSchemaType.MULTI_OPTIONS }, 'Should migrate Multioptions V2 data to V3 correctly');
    });

    test.skip('@unit: should return null for invalid Multioptions data after migration', () => {
        const dataMultiV1 = {
            input: 'source/path',
            output: 'generated/path',
            client: 'invalid-client', // Некорректное значение
            items: [{ input: 'item1' }, { input: 'item2' }],
        };
        const result = migrateToLatestVersion({
            rawInput: dataMultiV1,
            versionedSchemas: multiOptionsVersionedSchema,
            migrationPlans: multiOptionsMigrationPlan,
        });

        assert.equal(result, null, 'Should return null for invalid Multioptions data');
    });

    test.skip('@unit: should throw error if no migration plan exists for Multioptions', () => {
        const dataMultiV1 = {
            input: 'source/path',
            output: 'generated/path',
            client: 'axios',
            items: [{ input: 'item1' }, { input: 'item2' }],
        };
        assert.throws(
            () => {
                migrateToLatestVersion({
                    rawInput: dataMultiV1,
                    versionedSchemas: multiOptionsVersionedSchema,
                    migrationPlans: [],
                });
            },
            /No migration plan from 1.0.0/,
            'Should throw for missing migration plan in Multioptions'
        );
    });
});
