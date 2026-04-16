import assert from 'node:assert';
import { describe, test } from 'node:test';

import { Context } from '../../../../Context';
import { xTypescriptTypePlugin } from '../../../../plugins/builtins/xTypescriptTypePlugin';
import { getOutputPaths } from '../../../../utils/getOutputPaths';
import { Parser } from '../../Parser';

describe('@unit: getModel (v3)', () => {
    test('should prioritize x-typescript-type over format binary', () => {
        const context = new Context({
            input: 'test/spec/v3.json',
            output: getOutputPaths({ output: './generated' }),
            plugins: [xTypescriptTypePlugin],
        });
        const parser = new Parser(context);

        const model = parser.getModel({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            openApi: {} as any,
            definition: {
                type: 'string',
                format: 'binary',
                'x-typescript-type': 'File',
            },
            parentRef: '',
        });

        assert.strictEqual(model.export, 'generic');
        assert.strictEqual(model.base, 'File');
        assert.strictEqual(model.type, 'File');
    });
});
