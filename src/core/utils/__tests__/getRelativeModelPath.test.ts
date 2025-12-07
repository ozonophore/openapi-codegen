import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getRelativeModelPath } from '../getRelativeModelPath';

describe('@unit: getRelativeModelPath', () => {
    test('hould return model relative path', () => {
        const modelRelativePath = '../../../models/truck';

        const result = getRelativeModelPath(undefined, modelRelativePath);
        assert.strictEqual(result, '../../../models/truck');
    });

    test('should return correct model relative path considering navigation symbols', () => {
        const rootPath = '/home/generated';
        const modelRelativePath = '../../../models/truck';

        const result = getRelativeModelPath(rootPath, modelRelativePath);
        assert.strictEqual(result, 'models/Truck');
    });
});
