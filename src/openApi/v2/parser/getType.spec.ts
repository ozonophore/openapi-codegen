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
        expect(type.type).toEqual('string[]');
        expect(type.base).toEqual('string');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should convert template with primary', () => {
        const type = getType('#/definitions/Link[string]');
        expect(type.type).toEqual('Link<string>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('string');
        expect(type.imports).toEqual([
            {
                name: 'Link',
                alias: '',
                path: 'Link',
            },
        ]);
    });

    it('should convert template with model', () => {
        const type = getType('#/definitions/Link[Model]');
        expect(type.type).toEqual('Link<Model>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('Model');
        expect(type.imports).toEqual([
            {
                name: 'Link',
                alias: '',
                path: 'Link',
            },
            {
                name: 'Model',
                alias: '',
                path: 'Model',
            },
        ]);
    });

    it('should have double imports', () => {
        const type = getType('#/definitions/Link[Link]');
        expect(type.type).toEqual('Link<Link>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('Link');
        expect(type.imports).toEqual([
            {
                name: 'Link',
                alias: '',
                path: 'Link',
            },
            {
                name: 'Link',
                alias: '',
                path: 'Link',
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
        expect(type.type).toEqual('model_000');
        expect(type.base).toEqual('model_000');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'model_000',
                alias: '',
                path: 'model.000',
            },
        ]);
    });

    it('should support dashes', () => {
        const type = getType('#/definitions/some_special-schema');
        expect(type.type).toEqual('some_special_schema');
        expect(type.base).toEqual('some_special_schema');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'some_special_schema',
                alias: '',
                path: 'some_special-schema',
            },
        ]);
    });

    it('should support dollar sign', () => {
        const type = getType('#/definitions/$some+special+schema');
        expect(type.type).toEqual('$some_special_schema');
        expect(type.base).toEqual('$some_special_schema');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: '$some_special_schema',
                alias: '',
                path: '$some+special+schema',
            },
        ]);
    });
});
