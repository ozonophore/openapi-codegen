import { relative } from './path';

describe('path', () => {
    it('should relative', () => {
        expect(relative('/test/server', '/test/model')).toEqual('./../model/');
        expect(relative('/test/server', '/test/server')).toEqual('./');
        expect(relative('/test/server', '/test/server/model')).toEqual('./model/');
        expect(relative('/test/server', '/model')).toEqual('./../../model/');
        expect(relative('/test', '/test')).toEqual('./');
        expect(relative('/test', '/test/model')).toEqual('./model/');
    });
});
