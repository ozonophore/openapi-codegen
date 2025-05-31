import assert from 'node:assert';
import { describe, test } from 'node:test';

import { escapeName } from '../escapeName';

describe('escapeName', () => {
    test('@unit: should escape', () => {
        assert.strictEqual(escapeName(''), '');
        assert.strictEqual(escapeName('fooBar'), 'fooBar');
        assert.strictEqual(escapeName('Foo Bar'), `'Foo Bar'`);
        assert.strictEqual(escapeName('foo bar'), `'foo bar'`);
        assert.strictEqual(escapeName('foo-bar'), `'foo-bar'`);
        assert.strictEqual(escapeName('foo.bar'), `'foo.bar'`);
        assert.strictEqual(escapeName('foo_bar'), 'foo_bar');
        assert.strictEqual(escapeName('123foo.bar'), `'123foo.bar'`);
        assert.strictEqual(escapeName('@foo.bar'), `'@foo.bar'`);
        assert.strictEqual(escapeName('$foo.bar'), `'$foo.bar'`);
        assert.strictEqual(escapeName('_foo.bar'), `'_foo.bar'`);
        assert.strictEqual(escapeName('123foobar'), `'123foobar'`);
        assert.strictEqual(escapeName('@foobar'), `'@foobar'`);
        assert.strictEqual(escapeName('$foobar'), '$foobar');
        assert.strictEqual(escapeName('_foobar'), '_foobar');
    });
});
