import { getRelativeModelPath } from './getRelativeModelPath';

describe('getRelativeModelPath', () => {
    it('should return correct model relative path considering navigation symbols', () => {
        const rootPath = '/home/generated';
        const modelRelativePath = '../../../models/truck';

        const result = getRelativeModelPath(rootPath, modelRelativePath);
        expect(result).toEqual('models/truck');
    });
});
