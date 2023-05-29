import { getRelativeModelImportPath } from './getRelativeModelImportPath';

describe('getRelativeModelImportPath', () => {
    it('should return relative path of the model import', () => {
        const modelRelativePath = './models/truck';
        const relativePath = '../../common/car';
        expect(getRelativeModelImportPath(undefined, relativePath, modelRelativePath)).toEqual('../../common/car');
    });

    it('should return the correct relative path of the model import, taking into account the navigation characters', () => {
        const rootPath = '/home/generated';
        let modelRelativePath = './models/truck';
        let relativePath = '../../common/car';

        expect(getRelativeModelImportPath(rootPath, relativePath, modelRelativePath)).toEqual('../common/car');

        modelRelativePath = './models/model/truck';
        relativePath = '../../models/car';
        expect(getRelativeModelImportPath(rootPath, relativePath, modelRelativePath)).toEqual('../car');
    });

    it('should return the correct relative path of the models import if an incorrect relative path to the model is passed', () => {
        const rootPath = '/home/generated';
        const modelRelativePath = '../../../models/truck';
        const relativePath = '../../common/car';

        expect(getRelativeModelImportPath(rootPath, relativePath, modelRelativePath)).toEqual('../common/car');
    });
});
