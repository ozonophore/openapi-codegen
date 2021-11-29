import { getType, GetTypeName } from './getType';

describe('getType', () => {
    it('should convert int', () => {
        const fnc = (type: string, ref?: string) => {
            return type;
        };
        const type = getType('int', '', fnc);
        expect(type.type).toEqual('number');
        expect(type.base).toEqual('number');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should convert string', () => {
        const fnc = (type: string, ref?: string) => {
            return type;
        };
        const type = getType('string', '', fnc);
        expect(type.type).toEqual('string');
        expect(type.base).toEqual('string');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should convert template with path', () => {
        const fnc = (type: string, ref?: string) => {
            return type;
        };
        const type = getType('#/components/schemas/first/second/Link', '', fnc);
        expect(type.type).toEqual('Link');
        expect(type.base).toEqual('Link');
        expect(type.path).toEqual('first/second/Link');
        expect(type.imports).toEqual([{ name: 'Link', alias: '', path: 'first/second/Link' }]);
    });

    it('should have double imports', () => {
        const fnc = (type: string, ref?: string) => {
            return type;
        };
        const type = getType('#/components/schemas/Link[Link]', '', fnc);
        expect(type.type).toEqual('LinkLink');
        expect(type.base).toEqual('LinkLink');
        expect(type.imports).toEqual([
            {
                name: 'LinkLink',
                alias: '',
                path: 'LinkLink',
            },
        ]);
    });

    it('should support dot', () => {
        const fnc = (type: string, ref?: string) => {
            return type;
        };
        const type = getType('#/components/schemas/model.000', '', fnc);
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
        const fnc = (type: string, ref?: string) => {
            return type;
        };
        const type = getType('#/components/schemas/some_special-schema', '', fnc);
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
        const fnc = (type: string, ref?: string) => {
            return type;
        };
        const type = getType('#/components/schemas/$some+special+schema', '', fnc);
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

    it('should support file with ext', () => {
        const fnc = (type: string, ref?: string) => {
            return type;
        };
        const type = getType('components/schemas/someSpecialSchema.json', '', fnc);
        expect(type.type).toEqual('SomeSpecialSchema');
        expect(type.base).toEqual('SomeSpecialSchema');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'SomeSpecialSchema',
                alias: '',
                path: 'components/schemas/SomeSpecialSchema',
            },
        ]);
    });

    it('should support external generation type', () => {
        const getTypeByRef: GetTypeName = (type: string, ref?: string | undefined) => {
            return 'ISomeSpecialSchema';
        };
        const type = getType('components/schemas/someSpecialSchema.json', '', getTypeByRef);
        expect(type.type).toEqual('ISomeSpecialSchema');
    });
});
