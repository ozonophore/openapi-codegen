import { pathToArray } from './pathToArray';

describe('pathToArray', () => {
    it('should convert path to array', () => {
        const path = '#/first/ref';
        const refs = pathToArray(path);
        expect(refs).toEqual(expect.arrayContaining(['first', 'ref']));
    });
});
