import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getClassName } from '../getClassName';

describe('getModelNames', () => {
    test('@unit: should retur classname', () => {
        const path = 'path1/path2/file';
        assert.strictEqual(getClassName(path), 'Path1Path2File');
    });
});
