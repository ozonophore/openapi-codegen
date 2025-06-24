import assert from 'node:assert';
import { describe, test } from 'node:test';

import { replaceString } from '../replaceString';

describe('replaceString', () => {
    test('@unit: should replace', () => {
        assert.strictEqual(replaceString(''), '');
        assert.strictEqual(replaceString('fooBar'), 'fooBar');
        assert.strictEqual(replaceString('Foo/Bar'), 'Foo/Bar');
        assert.strictEqual(replaceString('foo\\bar'), 'foo/bar');
        assert.strictEqual(replaceString('foo\\bar\\goal'), 'foo/bar/goal');
    });
});
