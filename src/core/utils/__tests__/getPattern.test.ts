import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getPattern } from '../getPattern';

describe('getPattern', () => {
    test('@unit: should produce correct result', () => {
        assert.strictEqual(getPattern(), undefined);
        assert.strictEqual(getPattern(''), '');
        assert.strictEqual(getPattern('^[a-zA-Z]'), '^[a-zA-Z]');
        assert.strictEqual(getPattern('^\\w+$'), '^\\\\w+$');
        assert.strictEqual(getPattern('^\\d{3}-\\d{2}-\\d{4}$'), '^\\\\d{3}-\\\\d{2}-\\\\d{4}$');
        assert.strictEqual(getPattern('\\'), '\\\\');
        assert.strictEqual(getPattern('\\/'), '\\\\/');
        assert.strictEqual(getPattern('\\/\\/'), '\\\\/\\\\/');
    });
});
