import assert from 'node:assert';
import { describe, test } from 'node:test';

import { generateOptionsSchema } from '../generate';

describe('@unit: generateOptionsSchema', () => {
    test('accepts openapiConfig only', () => {
        const parsed = generateOptionsSchema.safeParse({
            openapiConfig: './openapi.config.json',
        });
        assert.strictEqual(parsed.success, true);
    });

    test('accepts input and output without config', () => {
        const parsed = generateOptionsSchema.safeParse({
            input: './spec.json',
            output: './generated',
        });
        assert.strictEqual(parsed.success, true);
    });

    test('rejects both openapiConfig and input/output', () => {
        const parsed = generateOptionsSchema.safeParse({
            openapiConfig: './openapi.config.json',
            input: './spec.json',
            output: './generated',
        });
        assert.strictEqual(parsed.success, false);
    });

    test('rejects when neither config nor input/output is provided', () => {
        const parsed = generateOptionsSchema.safeParse({});
        assert.strictEqual(parsed.success, false);
    });

    test('requires non-empty input when using direct generation', () => {
        const parsed = generateOptionsSchema.safeParse({
            input: '   ',
            output: './generated',
        });
        assert.strictEqual(parsed.success, false);
    });

    test('requires non-empty output when using direct generation', () => {
        const parsed = generateOptionsSchema.safeParse({
            input: './spec.json',
            output: '',
        });
        assert.strictEqual(parsed.success, false);
    });

    test('accepts cache-related flags with config path', () => {
        const parsed = generateOptionsSchema.safeParse({
            openapiConfig: './openapi.config.json',
            cache: true,
            cachePath: '.cache.json',
            cacheStrategy: 'entity',
            cacheDebug: true,
        });
        assert.strictEqual(parsed.success, true);
    });
});
