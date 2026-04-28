import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getOperationResponseCode } from '../getOperationResponseCode';

describe('@unit: getOperationResponseCode', () => {
    test('should produce correct result', () => {
        assert.strictEqual(getOperationResponseCode(''), null);
        assert.strictEqual(getOperationResponseCode('default'), null);
        assert.strictEqual(getOperationResponseCode('200'), 200);
        assert.strictEqual(getOperationResponseCode('201'), 201);
        assert.strictEqual(getOperationResponseCode('2XX'), 200);
        assert.strictEqual(getOperationResponseCode('2xx'), 200);
        assert.strictEqual(getOperationResponseCode('300'), 300);
        assert.strictEqual(getOperationResponseCode('400'), 400);
        assert.strictEqual(getOperationResponseCode('abc'), null);
        assert.strictEqual(getOperationResponseCode('-100'), null);
        assert.strictEqual(getOperationResponseCode('20'), null);
        assert.strictEqual(getOperationResponseCode('200 OK'), null);
    });
});
