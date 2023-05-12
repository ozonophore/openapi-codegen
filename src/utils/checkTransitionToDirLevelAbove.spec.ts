import { replaceTransitionToDirLevelAbove } from './checkTransitionToDirLevelAbove';

describe('replaceTransitionToDirLevelAbove', () => {
    it('should retur current path', () => {
        const path = '../path1/path2/file';
        expect(replaceTransitionToDirLevelAbove(path)).toEqual('path1/path2/file');
    });
});
