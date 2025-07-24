import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getOperationParameterName } from '../getOperationParameterName';

describe('getOperationParameterName', () => {
    test('@unit: should produce correct result', () => {
        assert.strictEqual(getOperationParameterName(''), '');
        assert.strictEqual(getOperationParameterName('foobar'), 'foobar');
        assert.strictEqual(getOperationParameterName('fooBar'), 'fooBar');
        assert.strictEqual(getOperationParameterName('foo_bar'), 'fooBar');
        assert.strictEqual(getOperationParameterName('foo-bar'), 'fooBar');
        assert.strictEqual(getOperationParameterName('foo.bar'), 'fooBar');
        assert.strictEqual(getOperationParameterName('@foo.bar'), 'fooBar');
        assert.strictEqual(getOperationParameterName('$foo.bar'), 'fooBar');
        assert.strictEqual(getOperationParameterName('123.foo.bar'), 'fooBar');
        assert.strictEqual(getOperationParameterName('Foo-Bar'), 'fooBar');
        assert.strictEqual(getOperationParameterName('FOO-BAR'), 'fooBar');
    });
});
