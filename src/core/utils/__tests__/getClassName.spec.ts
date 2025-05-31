import { getClassName } from './getClassName';

describe('getModelNames', () => {
    it('should retur classname', () => {
        const path = 'path1/path2/file';
        expect(getClassName(path)).toEqual('Path1Path2File');
    });
});
