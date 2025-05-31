import { getRelativeModelImportPath } from './getRelativeModelImportPath';

const rootPath = '/openapi-codegen/generated/openapi/models';
let sourcePath = '';
let targetPath = '';

describe('getRelativeModelImportPath', () => {
    beforeEach(() => {
        sourcePath = '';
        targetPath = '';
    });

    it('The root folder is not specified', () => {
        sourcePath = '';
        targetPath = '../common/ModelWithString.yml';
        expect(getRelativeModelImportPath(undefined, sourcePath, targetPath)).toEqual('../common/ModelWithString');
    });

    it('The path for sourcePath is not specified. Option 1', () => {
        sourcePath = '';
        targetPath = 'ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./ModelWithString');
    });

    it('The path for sourcePath is not specified. Option 2', () => {
        sourcePath = '';
        targetPath = '../ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./ModelWithString');
    });

    it('The path for sourcePath is not specified. Option 3', () => {
        sourcePath = '';
        targetPath = '../common/ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./common/ModelWithString');
    });

    it('The path for sourcePath is the area inside the file. Option 1', () => {
        sourcePath = '#/components/schemas/SimpleRequestBody';
        targetPath = 'ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./ModelWithString');
    });

    it('The path for sourcePath is the area inside the file. Option 2', () => {
        sourcePath = '#/components/schemas/SimpleRequestBody';
        targetPath = '../ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./ModelWithString');
    });

    it('The path for sourcePath is the area inside the file. Option 3', () => {
        sourcePath = '#/components/schemas/SimpleRequestBody';
        targetPath = '../common/ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./common/ModelWithString');
    });

    it('The path for sourcePath contains the folder, the path for targetPath contains the file name.', () => {
        sourcePath = 'model/SimpleRequestBody.yml';
        targetPath = 'ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./ModelWithString');
    });

    it('The path for source Path contains a folder, the path for targetPath contains one jump to the folder above.', () => {
        sourcePath = 'model/SimpleRequestBody.yml';
        targetPath = '../common/ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('../common/ModelWithString');
    });

    it('The path for sourcePath contains a folder, the path for targetPath contains several transitions to the folder above.', () => {
        sourcePath = 'model/SimpleRequestBody.yml';
        targetPath = '../../common/ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('../common/ModelWithString');
    });

    it('The path for sourcePath goes beyond the root folder, the path for targetPath is the file name.', () => {
        sourcePath = '../common/SimpleRequestBody.yml';
        targetPath = 'ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./ModelWithString');
    });

    it('The path for sourcePath goes beyond the root folder, the path for targetPath is a file in the same folder.', () => {
        sourcePath = '../common/SimpleRequestBody.yml';
        targetPath = './ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('./ModelWithString');
    });

    it('The path for sourcePath contains several nested folders, the path for targetPath has a jump to the folder above', () => {
        sourcePath = 'model/list/SimpleRequestBody.yml';
        targetPath = '../ModelWithString.yml';

        expect(getRelativeModelImportPath(rootPath, sourcePath, targetPath)).toEqual('../ModelWithString');
    });
});
