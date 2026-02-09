import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getRelativeModelPath } from '../getRelativeModelPath';

describe('@unit: getRelativeModelPath', () => {
    test('should return model relative path when root is undefined', () => {
        const modelRelativePath = '../../../models/truck';

        const result = getRelativeModelPath(undefined, modelRelativePath);
        assert.strictEqual(result, '../../../models/truck');
    });

    test('should return correct model relative path considering navigation symbols', () => {
        const rootPath = '/home/generated';
        const modelRelativePath = '../../../models/truck';

        const result = getRelativeModelPath(rootPath, modelRelativePath);
        assert.strictEqual(result, 'models/truck');
    });

    test('should collapse absolute path to type name', () => {
        const rootPath = '/home/generated';
        const modelAbsolutePath = '/home/other/models/truck';

        const result = getRelativeModelPath(rootPath, modelAbsolutePath);
        assert.strictEqual(result, 'truck');
    });
});
