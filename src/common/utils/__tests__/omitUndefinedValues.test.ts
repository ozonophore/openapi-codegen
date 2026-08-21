import assert from 'node:assert/strict';
import test from 'node:test';

import { omitUndefinedValues } from '../omitUndefinedValues';

test('@unit: omitUndefinedValues drops undefined deeply', () => {
    const result = omitUndefinedValues({
        a: 1,
        b: undefined,
        nested: { c: undefined, d: 2 },
        list: [{ e: undefined, f: 3 }, 4],
    });

    assert.deepEqual(result, {
        a: 1,
        nested: { d: 2 },
        list: [{ f: 3 }, 4],
    });
});
