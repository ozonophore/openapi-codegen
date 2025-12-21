import assert from 'node:assert';
import { describe, test } from 'node:test';

import { escapeDescription } from '../escapeDescription';

describe('@unit: escapeDescription', () => {
    test('should escape', () => {
        assert.strictEqual(escapeDescription('foo `test` bar'), 'foo \\`test\\` bar');
    });

    test('should not escape', () => {
        assert.strictEqual(escapeDescription(''), '');
        assert.strictEqual(escapeDescription('fooBar'), 'fooBar');
        assert.strictEqual(escapeDescription('foo \\`test\\` bar'), 'foo \\`test\\` bar');
        assert.strictEqual(escapeDescription('foo */bar/*'), 'foo *_/bar/*');
    });
});
