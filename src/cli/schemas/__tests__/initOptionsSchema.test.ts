import assert from 'node:assert';
import { describe, test } from 'node:test';

import { initOptionsSchema } from '../init';

describe('@unit: initOptionsSchema', () => {
    test('accepts minimal options', () => {
        const parsed = initOptionsSchema.safeParse({});
        assert.strictEqual(parsed.success, true);
    });

    test('accepts interactive init flags', () => {
        const parsed = initOptionsSchema.safeParse({
            specsDir: './openapi',
            request: './src/custom/request.ts',
            useCancelableRequest: true,
            useInteractiveMode: true,
        });
        assert.strictEqual(parsed.success, true);
    });

    test('converts empty strings to undefined', () => {
        const parsed = initOptionsSchema.safeParse({
            specsDir: '',
            request: '',
        });
        assert.strictEqual(parsed.success, true);
        if (parsed.success) {
            assert.strictEqual(parsed.data.specsDir, undefined);
            assert.strictEqual(parsed.data.request, undefined);
        }
    });

    test('treats empty openapiConfig as undefined', () => {
        const parsed = initOptionsSchema.safeParse({
            openapiConfig: '',
        });
        assert.strictEqual(parsed.success, true);
        if (parsed.success) {
            assert.strictEqual(parsed.data.openapiConfig, undefined);
        }
    });
});
