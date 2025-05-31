import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getServiceVersion } from '../getServiceVersion';

describe('getServiceVersion', () => {
    test('@unit: should produce correct result', () => {
        assert.strictEqual(getServiceVersion('1.0'), '1.0');
        assert.strictEqual(getServiceVersion('v1.0'), '1.0');
        assert.strictEqual(getServiceVersion('V1.0'), '1.0');
    });
});
