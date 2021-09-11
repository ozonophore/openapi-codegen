import { getFileName } from './getFileName';

describe('getFileName', () => {
    it('should return file name', () => {
        const path = 'path1/path2/file.json';
        expect(getFileName(path)).toEqual('file');
    });
});
