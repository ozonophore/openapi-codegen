import assert from 'node:assert';
import { describe, test } from 'node:test';

import { isString } from '../isString';

describe('isString', () => {
    test('@unit: should produce correct result', () => {
        assert.ok(isString('foo'));
        assert.ok(isString('123'));
        assert.ok(isString('-1'));
        assert.ok(isString(''));
        assert.strictEqual(isString(null), false);
        assert.strictEqual(isString(undefined), false);
        assert.strictEqual(isString({}), false);
    });
});
