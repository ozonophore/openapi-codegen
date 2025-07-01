import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getServiceClassName } from '../getServiceClassName';

describe('getServiceClassName', () => {
    test('@unit: should produce correct result', () => {
        assert.strictEqual(getServiceClassName(''), '');
        assert.strictEqual(getServiceClassName('FooBar'), 'FooBarService');
        assert.strictEqual(getServiceClassName('Foo Bar'), 'FooBarService');
        assert.strictEqual(getServiceClassName('foo bar'), 'FooBarService');
        assert.strictEqual(getServiceClassName('FooBarService'), 'FooBarService');
        assert.strictEqual(getServiceClassName('Foo Bar Service'), 'FooBarService');
        assert.strictEqual(getServiceClassName('foo bar service'), 'FooBarService');
        assert.strictEqual(getServiceClassName('@fooBar'), 'FooBarService');
        assert.strictEqual(getServiceClassName('$fooBar'), 'FooBarService');
        assert.strictEqual(getServiceClassName('123fooBar'), 'FooBarService');
    });
});
