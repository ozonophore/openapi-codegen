import assert from 'node:assert';
import { describe, test } from 'node:test';

import { flatMap } from '../flatMap';

describe('@unit: flatMap', () => {
    test('should produce correct result', () => {
        assert.deepEqual(flatMap([1, 2, 3], i => [i]), [1, 2, 3]);
        assert.deepEqual(flatMap([1, 2, 3], i => [i + 1]), [2, 3, 4]);
        assert.deepEqual(flatMap([1, 2, 3], () => [1]), [1, 1, 1]);
    });
});
