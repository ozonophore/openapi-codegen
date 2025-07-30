import assert from 'node:assert';
import { describe, test } from 'node:test';

import { validateAndSuggestKeyCorrections } from '../VersionedSchema/Utils/validateAndSuggestKeyCorrections';


describe('validateAndSuggestKeyCorrections', () => {
    test('@unit: should throw an error for unknown keys with a suggestion for correction', async () => {
        const inputKeys = ['nmae'];
        const allowedKeys = new Set(['name', 'title']);
        assert.throws(() => validateAndSuggestKeyCorrections(inputKeys, allowedKeys), /The "nmae" field is not recognized. Perhaps you meant "name"./);
    });

    test('@unit: should throw an error without suggestions for keys with a large distance', async () => {
        const inputKeys = ['unknown'];
        const allowedKeys = new Set(['name', 'title']);
        assert.throws(() => validateAndSuggestKeyCorrections(inputKeys, allowedKeys), /The "unknown" field is not recognized./);
    });

    test('@unit: should not throw an error for valid keys', async () => {
        const inputKeys = ['name', 'title'];
        const allowedKeys = new Set(['name', 'title']);
        assert.doesNotThrow(() => validateAndSuggestKeyCorrections(inputKeys, allowedKeys));
    });
});
