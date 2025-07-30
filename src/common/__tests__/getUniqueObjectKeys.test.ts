import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getUniqueObjectKeys } from '../VersionedSchema/Utils/getUniqueObjectKeys';

describe('getUniqueObjectKeys', () => {
    test('@unit: must return unique keys from the object', async () => {
        const input = { name: 'John', age: 30, nested: { id: 1 } };
        const result = getUniqueObjectKeys(input);
        assert.deepEqual(result, ['name', 'age', 'nested', 'id']);
    });

    test('@unit: must return unique keys from an array of objects', async () => {
        const input = [{ name: 'John' }, { age: 30 }];
        const result = getUniqueObjectKeys(input);
        assert.deepEqual(result, ['name', 'age']);
    });

    test('@unit: must return an empty array for an empty object', async () => {
        const result = getUniqueObjectKeys({});
        assert.deepEqual(result, []);
    });
});
