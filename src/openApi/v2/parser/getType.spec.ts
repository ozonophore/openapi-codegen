import { getType } from './getType';

describe('getType', () => {
    it('should convert int', () => {
        const type = getType('int');
        expect(type.type).toEqual('number');
        expect(type.base).toEqual('number');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should convert string', () => {
        const type = getType('string');
        expect(type.type).toEqual('string');
        expect(type.base).toEqual('string');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should convert string array', () => {
        const type = getType('array[string]');
        expect(type.type).toEqual('ArrayString');
        expect(type.base).toEqual('ArrayString');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                alias: '',
                name: 'ArrayString',
                path: 'ArrayString',
            },
        ]);
    });

    it('should convert template with primary', () => {
        const type = getType('#/definitions/Link[string]');
        expect(type.type).toEqual('LinkString');
        expect(type.base).toEqual('LinkString');
        expect(type.path).toEqual('LinkString');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'LinkString',
                alias: '',
                path: 'LinkString',
            },
        ]);
    });

    it('should convert template with model', () => {
        const type = getType('#/definitions/Link[Model]');
        expect(type.type).toEqual('LinkModel');
        expect(type.base).toEqual('LinkModel');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'LinkModel',
                alias: '',
                path: 'LinkModel',
            },
        ]);
    });

    it('should have double imports', () => {
        const type = getType('#/definitions/Link[Link]');
        expect(type.type).toEqual('LinkLink');
        expect(type.base).toEqual('LinkLink');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'LinkLink',
                alias: '',
                path: 'LinkLink',
            },
        ]);
    });

    it('should convert generic', () => {
        const type = getType('#/definitions/Link', 'Link');
        expect(type.type).toEqual('T');
        expect(type.base).toEqual('T');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should support dot', () => {
        const type = getType('#/definitions/model.000');
        expect(type.type).toEqual('Model000');
        expect(type.base).toEqual('Model000');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'Model000',
                alias: '',
                path: 'Model000',
            },
        ]);
    });

    it('should support dashes', () => {
        const type = getType('#/definitions/some_special-schema');
        expect(type.type).toEqual('SomeSpecialSchema');
        expect(type.base).toEqual('SomeSpecialSchema');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'SomeSpecialSchema',
                alias: '',
                path: 'SomeSpecialSchema',
            },
        ]);
    });

    it('should support dollar sign', () => {
        const type = getType('#/definitions/$some+special+schema');
        expect(type.type).toEqual('SomeSpecialSchema');
        expect(type.base).toEqual('SomeSpecialSchema');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'SomeSpecialSchema',
                alias: '',
                path: 'SomeSpecialSchema',
            },
        ]);
    });
});
