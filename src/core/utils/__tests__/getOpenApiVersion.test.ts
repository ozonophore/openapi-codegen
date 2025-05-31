import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getOpenApiVersion } from '../getOpenApiVersion';

describe('getOpenApiVersion', () => {
    test('@unit: should read the correct version', () => {
        assert.strictEqual(getOpenApiVersion({ openapi: '2' }), 2);
        assert.strictEqual(getOpenApiVersion({ openapi: '3' }), 3);
        assert.strictEqual(getOpenApiVersion({ openapi: '2.0' }), 2);
        assert.strictEqual(getOpenApiVersion({ openapi: '3.0' }), 3);

        assert.strictEqual(getOpenApiVersion({ swagger: '2' }), 2);
        assert.strictEqual(getOpenApiVersion({ swagger: '3' }), 3);
        assert.strictEqual(getOpenApiVersion({ swagger: '2.0' }), 2);
        assert.strictEqual(getOpenApiVersion({ swagger: '3.0' }), 3);
    });
});
