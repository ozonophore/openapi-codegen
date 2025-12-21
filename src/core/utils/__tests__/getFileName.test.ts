import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getFileName } from '../getFileName';

describe('@unit: getFileName', () => {
    test('should return file name', () => {
        const path = 'path1/path2/file.json';
        assert.strict(getFileName(path), 'file');
    });
});
