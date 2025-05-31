import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getOperationName } from '../getOperationName';

describe('getOperationName', () => {
    test('@unit: should produce correct result', () => {
        assert.strictEqual(getOperationName(''), '');
        assert.strictEqual(getOperationName('FooBar'), 'fooBar');
        assert.strictEqual(getOperationName('Foo Bar'), 'fooBar');
        assert.strictEqual(getOperationName('foo bar'), 'fooBar');
        assert.strictEqual(getOperationName('foo-bar'), 'fooBar');
        assert.strictEqual(getOperationName('foo_bar'), 'fooBar');
        assert.strictEqual(getOperationName('foo.bar'), 'fooBar');
        assert.strictEqual(getOperationName('@foo.bar'), 'fooBar');
        assert.strictEqual(getOperationName('$foo.bar'), 'fooBar');
        assert.strictEqual(getOperationName('_foo.bar'), 'fooBar');
        assert.strictEqual(getOperationName('-foo.bar'), 'fooBar');
        assert.strictEqual(getOperationName('123.foo.bar'), 'fooBar');
    });
});
