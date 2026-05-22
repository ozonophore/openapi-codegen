import assert from 'node:assert';
import { describe, test } from 'node:test';

import { checkConfigOptionsSchema } from '../checkConfig';
import { updateConfigOptionsSchema } from '../updateConfig';

describe('@unit: checkConfig and updateConfig schemas', () => {
    test('checkConfigOptionsSchema accepts empty options', () => {
        const parsed = checkConfigOptionsSchema.safeParse({});
        assert.strictEqual(parsed.success, true);
    });

    test('checkConfigOptionsSchema accepts openapiConfig path', () => {
        const parsed = checkConfigOptionsSchema.safeParse({
            openapiConfig: './custom/openapi.config.json',
        });
        assert.strictEqual(parsed.success, true);
    });

    test('checkConfigOptionsSchema treats empty openapiConfig as undefined', () => {
        const parsed = checkConfigOptionsSchema.safeParse({
            openapiConfig: '',
        });
        assert.strictEqual(parsed.success, true);
        if (parsed.success) {
            assert.strictEqual(parsed.data.openapiConfig, undefined);
        }
    });

    test('updateConfigOptionsSchema accepts valid paths', () => {
        const parsed = updateConfigOptionsSchema.safeParse({
            openapiConfig: './openapi.config.json',
        });
        assert.strictEqual(parsed.success, true);
    });

});
