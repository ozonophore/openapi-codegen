import assert from 'node:assert';
import { describe, test } from 'node:test';

import { unique, uniqueByKey } from '../unique';

describe('@unit: unique', () => {
    test('should return correct index', () => {
        assert.equal(unique('a', 0, ['a', 'b', 'c']), true);
        assert.equal(unique('a', 1, ['a', 'b', 'c']), false);
        assert.equal(unique('a', 2, ['a', 'b', 'c']), false);
        assert.equal(unique('a', 0, ['a', 'b', 'c']), true);
        assert.equal(unique('a', 1, ['z', 'a', 'b']), true);
        assert.equal(unique('a', 2, ['y', 'z', 'a']), true);
    });

    test('uniqueByKey keeps first item per key', () => {
        const items = [
            { path: 'a', name: 'User' },
            { path: 'b', name: 'User' },
            { path: 'a', name: 'User' },
        ];
        assert.deepEqual(
            uniqueByKey(items, item => `${item.path}\0${item.name}`),
            [
                { path: 'a', name: 'User' },
                { path: 'b', name: 'User' },
            ]
        );
    });
});
