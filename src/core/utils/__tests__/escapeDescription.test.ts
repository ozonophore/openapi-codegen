import assert from 'node:assert';
import { describe, test } from 'node:test';

import { escapeDescription } from '../escapeDescription';

describe('escapeDescription', () => {
    test('@unit: should escape', () => {
        assert.strictEqual(escapeDescription('foo `test` bar'), 'foo \\`test\\` bar');
    });

    test('@unit: should not escape', () => {
        assert.strictEqual(escapeDescription(''), '');
        assert.strictEqual(escapeDescription('fooBar'), 'fooBar');
        assert.strictEqual(escapeDescription('foo \\`test\\` bar'), 'foo \\`test\\` bar');
        assert.strictEqual(escapeDescription('foo */bar/*'), 'foo *_/bar/*');
    });
});
