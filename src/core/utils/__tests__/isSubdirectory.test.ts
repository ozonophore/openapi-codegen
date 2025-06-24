import assert from 'node:assert';
import { describe, test } from 'node:test';

import { resolve } from 'path';

import { isSubDirectory } from '../isSubdirectory';

describe('isSubDirectory', () => {
    test('@unit: should return correct result', () => {
        assert.strictEqual(isSubDirectory(resolve('/'), resolve('/')), false);
        assert.strictEqual(isSubDirectory(resolve('.'), resolve('.')), false);
        assert.strictEqual(isSubDirectory(resolve('./project'), resolve('./project')), false);
        assert.strictEqual(isSubDirectory(resolve('./project'), resolve('../')), false);
        assert.strictEqual(isSubDirectory(resolve('./project'), resolve('../../')), false);
        assert.ok(isSubDirectory(resolve('./'), resolve('./output')));
        assert.strictEqual(isSubDirectory(resolve('./'), resolve('../output')), false);
    });
});
