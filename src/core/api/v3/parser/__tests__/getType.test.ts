import assert from 'node:assert';
import { describe, test } from 'node:test';

import SwaggerParser from '@apidevtools/swagger-parser';

import { Context } from '../../../../Context';
import { getOutputPaths } from '../../../../utils/getOutputPaths';
import { Parser } from '../../Parser';

describe('getType', () => {
    test('@unit: should convert int', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const parser = new SwaggerParser();
        const context = new Context({ input: 'test/spec/v3.yml', output: getOutputPaths({ output: './generated' }) });
        context.addRefs(await parser.resolve('test/spec/v3.yml'));
        const type = new Parser(context).getType('int', '');
        assert.strictEqual(type.type, 'number');
        assert.strictEqual(type.base, 'number');
        assert.strictEqual(type.template, null);
        assert.deepStrictEqual(type.imports, []);
    });

    test.skip('@unit: should support file with ext', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const parser = new SwaggerParser();
        const context = new Context({ input: 'test/spec/v3.yml', output: getOutputPaths({ output: './generated' }) });
        context.addRefs(await parser.resolve('test/spec/v3.yml'));
        const type = new Parser(context).getType('schemas/ModelWithString.yml', '');
        assert.strictEqual(type.type, 'ModelWithString');
        assert.strictEqual(type.base, 'ModelWithString');
        assert.strictEqual(type.template, null);
        assert.deepStrictEqual(type.imports, [
            {
                name: 'ModelWithString',
                alias: '',
                path: './schemas/ModelWithString',
            },
        ]);
    });
});
