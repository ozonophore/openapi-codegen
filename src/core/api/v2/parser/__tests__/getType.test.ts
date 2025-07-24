import assert from 'node:assert';
import { describe, test } from 'node:test';

import RefParser from 'json-schema-ref-parser';

import { Context } from '../../../../Context';
import { getOutputPaths } from '../../../../utils/getOutputPaths';
import { Parser } from '../../Parser';

describe('getType', () => {
    test('@unit: should convert int', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const parser = new RefParser();
        const context = new Context('test/spec/v3.yml', getOutputPaths({ output: './generated' }));
        context.addRefs(await parser.resolve('test/spec/v3.yml'));
        const type = new Parser(context).getType('int', '');
        assert.strictEqual(type.type, 'number');
        assert.strictEqual(type.base, 'number');
        assert.strictEqual(type.template, null);
        assert.deepStrictEqual(type.imports, []);
    });

    test('@unit: should support file with ext', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const parser = new RefParser();
        const context = new Context('test/spec/v3.yml', getOutputPaths({ output: './generated' }));
        context.addRefs(await parser.resolve('test/spec/v3.yml'));
        const type = new Parser(context).getType('schemas/ModelWithString.yml', '');
        assert.strictEqual(type.type, 'IModelWithString');
        assert.strictEqual(type.base, 'IModelWithString');
        assert.strictEqual(type.template, null);
        assert.deepStrictEqual(type.imports, [
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

    test('@unit: should support external generation type', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const parser = new RefParser();
        const context = new Context(object, getOutputPaths({ output: './generated' }));
        context.addRefs(await parser.resolve(object));
        const type = new Parser(context).getType('#/components/schemas/someSpecialSchema', '');
        assert.strictEqual(type.type, 'ISomeSpecialSchema');
    });
});
