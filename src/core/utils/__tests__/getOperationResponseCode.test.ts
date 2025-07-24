import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getOperationResponseCode } from '../getOperationResponseCode';

describe('getOperationResponseCode', () => {
    test('@unit: should produce correct result', () => {
        assert.strictEqual(getOperationResponseCode(''), null);
        assert.strictEqual(getOperationResponseCode('default'), 200);
        assert.strictEqual(getOperationResponseCode('200'), 200);
        assert.strictEqual(getOperationResponseCode('300'), 300);
        assert.strictEqual(getOperationResponseCode('400'), 400);
        assert.strictEqual(getOperationResponseCode('abc'), null);
        assert.strictEqual(getOperationResponseCode('-100'), 100);
    });
});
