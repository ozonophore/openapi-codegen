import assert from 'node:assert';
import { describe, test } from 'node:test';

import { optionsMigrationPlans } from 'common/VersionedSchema/OptionsMigrationPlans';
import { optionsVersionedSchemas } from 'common/VersionedSchema/OptionsVersionedSchemas';

import { HttpClient } from '../../core';
import { EVersionedSchemaType } from '../VersionedSchema/Enums';
import { migrateToLatestVersion } from '../VersionedSchema/Utils/migrateToLatestVersion';

describe('migrateToLatestVersion', () => {
    test('@unit: should migrate data from 1.0.0 to 2.0.0', () => {
        const dataV1 = { input: 'source/path', output: 'generated/path', client: HttpClient.AXIOS };
        const expectedDataV3 = {
            input: 'source/path',
            output: 'generated/path',
            httpClient: HttpClient.AXIOS,
            useCancelableRequest: false,
        };

        const result = migrateToLatestVersion({
            rawInput: dataV1,
            versionedSchemas: optionsVersionedSchemas,
            migrationPlans: optionsMigrationPlans,
        });

        assert.deepEqual(result, { value: expectedDataV3, schemaVersion: '2.0.0', schemaType: EVersionedSchemaType.OPTIONS }, 'Should migrate 1.0.0 data to 2.0.0 correctly');
    });

    test('@unit: should migrate data from 1.0.1 to 2.0.0', () => {
        const dataV2 = { input: 'source/path', output: 'generated/path', httpClient: HttpClient.FETCH };
        const expectedDataV3 = {
            input: 'source/path',
            output: 'generated/path',
            httpClient: HttpClient.FETCH,
        };

        const result = migrateToLatestVersion({
            rawInput: dataV2,
            versionedSchemas: optionsVersionedSchemas,
            migrationPlans: optionsMigrationPlans,
        });

        assert.deepEqual(result, { value: expectedDataV3, schemaVersion: '2.0.0', schemaType: EVersionedSchemaType.OPTIONS }, 'Should migrate 1.0.1 data to 2.0.0 correctly');
    });

    test.skip('@unit: should return null for invalid data after migration', () => {
        const dataV1 = { input: 'source/path', output: 'generated/path', client: 'invalid-client' };
        const result = migrateToLatestVersion({
            rawInput: dataV1,
            versionedSchemas: optionsVersionedSchemas,
            migrationPlans: optionsMigrationPlans,
        });

        assert.equal(result, null, 'Should return null for invalid data');
    });

    test('@unit: should throw error if no migration plan exists', () => {
        const dataV1 = { input: 'source/path', output: 'generated/path', client: HttpClient.AXIOS };
        assert.throws(
            () => {
                migrateToLatestVersion({
                    rawInput: dataV1,
                    versionedSchemas: optionsVersionedSchemas,
                    migrationPlans: [],
                });
            },
            /No migration plan from 1.0.0/,
            'Should throw for missing migration plan'
        );
    });
});
