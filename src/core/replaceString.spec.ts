import { replaceString } from './replaceString';

describe('replaceString', () => {
    it('should replace', () => {
        expect(replaceString('')).toEqual('');
        expect(replaceString('fooBar')).toEqual('fooBar');
        expect(replaceString('Foo/Bar')).toEqual('Foo/Bar');
        expect(replaceString('foo\\bar')).toEqual('foo/bar');
        expect(replaceString('foo\\bar\\goal')).toEqual('foo/bar/goal');
    });
});
