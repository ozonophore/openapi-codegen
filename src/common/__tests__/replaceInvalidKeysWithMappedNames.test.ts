import assert from 'node:assert';
import { describe, test } from 'node:test';

import { replaceInvalidKeysWithMappedNames } from '../VersionedSchema/Utils/replaceInvalidKeysWithMappedNames';

describe('replaceInvalidKeysWithMappedNames', () => {
    test('@unit: must replace invalid keys in the object', async () => {
        const input = { nmae: 'John', title: 'Mr' };
        const keyMap = new Map([['nmae', 'name']]);
        const result = replaceInvalidKeysWithMappedNames(input, keyMap);
        assert.deepEqual(result, { name: 'John', title: 'Mr' });
    });

    test('@unit: must replace invalid keys in an array of objects', async () => {
        const input = [{ nmae: 'John' }, { nmae: 'Jane' }];
        const keyMap = new Map([['nmae', 'name']]);
        const result = replaceInvalidKeysWithMappedNames(input, keyMap);
        assert.deepEqual(result, [{ name: 'John' }, { name: 'Jane' }]);
    });

    test('@unit: should throw an error for null or undefined', async () => {
        assert.throws(() => replaceInvalidKeysWithMappedNames(null as any, new Map()), /The input data cannot be null or undefined./);
    });
});
