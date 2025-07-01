import assert from 'node:assert';
import { describe, test } from 'node:test';

import { optionsVersionedSchemas } from 'common/VersionedSchema/OptionsVersionedSchemas';

import { HttpClient } from '../../core';
import {guessVersion} from '../VersionedSchema/Utils/guessVersion';

describe('guessVersion', () => {
    test('@unit: should correctly identify version for 1.0.0 data', () => {
        const dataV1 = { input: 'source/path', output: 'generated/path', client: HttpClient.AXIOS };
        const result = guessVersion(dataV1, optionsVersionedSchemas);
        assert.deepEqual(result, { version: '1.0.0', index: 0 }, 'Should detect 1.0.0 schema');
    });

    test('@unit: should correctly identify version for 2.0.0 data', () => {
        const dataV2 = { input: 'source/path', output: 'generated/path', httpClient: HttpClient.FETCH };
        const result = guessVersion(dataV2, optionsVersionedSchemas);
        assert.deepEqual(result, { version: '2.0.0', index: 2 }, 'Should detect 2.0.0 schema');
    });

    test('@unit: should throw error for data matching no schemas', () => {
        const invalidData = { input: 'source/path', output: 'generated/path', unknownField: 'value' };
        assert.throws(() => guessVersion(invalidData, optionsVersionedSchemas), /Data does not conform to any known version schema/, 'Should throw for invalid data');
    });
});