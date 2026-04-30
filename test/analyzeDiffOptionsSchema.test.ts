import assert from 'node:assert';
import { describe, test } from 'node:test';

import { analyzeDiffOptionsSchema } from '../src/cli/schemas/analyzeDiff';

describe('@unit: analyze-diff options schema', () => {
    test('accepts input without compareWith and git for skip scenario', () => {
        const parsed = analyzeDiffOptionsSchema.safeParse({
            input: './test/spec/v3.json',
        });
        assert.strictEqual(parsed.success, true);
    });

    test('accepts input with git ref only', () => {
        const parsed = analyzeDiffOptionsSchema.safeParse({
            input: './test/spec/v3.json',
            git: 'HEAD~1',
        });
        assert.strictEqual(parsed.success, true);
    });

    test('accepts input with compareWith only', () => {
        const parsed = analyzeDiffOptionsSchema.safeParse({
            input: './test/spec/v3.json',
            compareWith: './test/spec/v2.json',
        });
        assert.strictEqual(parsed.success, true);
    });

    test('accepts both compareWith and git for runtime priority', () => {
        const parsed = analyzeDiffOptionsSchema.safeParse({
            input: './test/spec/v3.json',
            compareWith: './test/spec/v2.json',
            git: 'HEAD~1',
        });
        assert.strictEqual(parsed.success, true);
    });

    test('fails when input is missing', () => {
        const parsed = analyzeDiffOptionsSchema.safeParse({
            git: 'HEAD~1',
        });
        assert.strictEqual(parsed.success, false);
    });
});
