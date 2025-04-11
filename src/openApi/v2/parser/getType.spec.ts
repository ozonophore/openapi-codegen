import RefParser from 'json-schema-ref-parser';

import { Context } from '../../../core/Context';
import { getOutputPaths } from '../../../core/getOutputPaths';
import { Parser } from '../Parser';

describe('getType', () => {
    it('should convert int', async () => {
        const parser = new RefParser();
        const context = new Context('test/spec/v3.yml', getOutputPaths({ output: './generated' }));
        context.addRefs(await parser.resolve('test/spec/v3.yml'));
        const type = new Parser(context).getType('int', '');
        expect(type.type).toEqual('number');
        expect(type.base).toEqual('number');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should support file with ext', async () => {
        const parser = new RefParser();
        const context = new Context('test/spec/v3.yml', getOutputPaths({ output: './generated' }));
        context.addRefs(await parser.resolve('test/spec/v3.yml'));
        const type = new Parser(context).getType('schemas/ModelWithString.yml', '');
        expect(type.type).toEqual('IModelWithString');
        expect(type.base).toEqual('IModelWithString');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([
            {
                name: 'IModelWithString',
                alias: '',
                path: './schemas/ModelWithString',
            },
        ]);
    });

    const object = {
        components: {
            schemas: {
                someSpecialSchema: {
                    type: 'object',
                },
            },
        },
    };

    it('should support external generation type', async () => {
        const parser = new RefParser();
        const context = new Context(object, getOutputPaths({ output: './generated' }));
        context.addRefs(await parser.resolve(object));
        const type = new Parser(context).getType('#/components/schemas/someSpecialSchema', '');
        expect(type.type).toEqual('ISomeSpecialSchema');
    });
});
