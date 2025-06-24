import assert from 'node:assert';
import { describe, test } from 'node:test';

import { sort } from '../sort';

describe('sort', () => {
    test('@unit: should return correct index', () => {
        assert.strictEqual(sort('a', 'b'), -1);
        assert.strictEqual(sort('b', 'a'), 1);
        assert.strictEqual(sort('a', 'a'), 0);
        assert.strictEqual(sort('', ''), 0);
    });
});
