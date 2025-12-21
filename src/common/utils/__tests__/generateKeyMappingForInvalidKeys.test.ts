import assert from 'node:assert';
import { describe, test } from 'node:test';

import { generateKeyMappingForInvalidKeys } from '../../VersionedSchema/Utils/generateKeyMappingForInvalidKeys';

describe('@unit: generateKeyMappingForInvalidKeys', () => {
    test('must create a replacement card for invalid keys', async () => {
        const inputKeys = ['nmae', 'title'];
        const allowedKeys = new Set(['name', 'title']);
        const result = generateKeyMappingForInvalidKeys(inputKeys, allowedKeys);
        assert.deepEqual(result, new Map([['nmae', 'name']]));
    });

    test('must return an empty card if all keys are valid.', async () => {
        const inputKeys = ['name', 'title'];
        const allowedKeys = new Set(['name', 'title']);
        const result = generateKeyMappingForInvalidKeys(inputKeys, allowedKeys);
        assert.deepEqual(result, new Map());
    });
});
