import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { Context } from '../Context';
import { createResolvedContext } from '../createResolvedContext';
import { getOutputPaths } from '../utils/getOutputPaths';

const WINDOWS_FILE = 'C:/proj/api.yaml';
const POINTER = '#/components/schemas/Foo';
const WINDOWS_CANONICAL = `${WINDOWS_FILE}${POINTER}`;

const schemaObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
    },
};

const openApiDocument = {
    openapi: '3.0.0',
    paths: {
        '/foo': {
            get: {
                responses: {
                    '200': {
                        description: 'ok',
                        content: {
                            'application/json': {
                                schema: { $ref: `${WINDOWS_FILE}${POINTER}` },
                            },
                        },
                    },
                },
            },
        },
    },
    components: { schemas: { Foo: schemaObject } },
};

function createRecordingRefs() {
    const getKeys: string[] = [];
    const existsKeys: string[] = [];

    const refs = {
        values: () => ({}),
        paths: () => [WINDOWS_FILE],
        get: (key: string) => {
            getKeys.push(key);
            if (typeof key === 'string' && key.includes(POINTER)) {
                return schemaObject;
            }
            return openApiDocument;
        },
        exists: (key: string) => {
            existsKeys.push(key);
            return typeof key === 'string' && key.includes(POINTER);
        },
    };

    return { refs, getKeys, existsKeys };
}

describe('@unit: Context Canonical Ref lookup', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    test('get/exists with Windows parser keys does not need path.win32', () => {
        const { refs, getKeys, existsKeys } = createRecordingRefs();
        const context = new Context({
            input: WINDOWS_FILE,
            output: getOutputPaths({ output: './generated' }),
        });
        context.attachResolvedOpenApi(refs, WINDOWS_FILE);
        getKeys.length = 0;
        existsKeys.length = 0;

        assert.equal(context.get(POINTER, WINDOWS_FILE), schemaObject);
        assert.equal(getKeys[getKeys.length - 1], WINDOWS_CANONICAL);
        assert.equal(context.get('C:\\proj\\api.yaml#/components/schemas/Foo'), schemaObject);
        assert.equal(getKeys[getKeys.length - 1], WINDOWS_CANONICAL);
        assert.equal(context.exists(POINTER, WINDOWS_FILE), true);
        assert.equal(context.exists('./missing.yaml', WINDOWS_FILE), false);
        assert.ok(!existsKeys.includes('./missing.yaml'));
    });

    test('relative Tree $ref without parent throws', () => {
        const { refs } = createRecordingRefs();
        const context = new Context({
            input: WINDOWS_FILE,
            output: getOutputPaths({ output: './generated' }),
        });
        context.attachResolvedOpenApi(refs, WINDOWS_FILE);
        assert.throws(() => context.get('./Pet.yaml'), /Parent source file/);
    });

    test('POSIX unix path + fragment still resolves', async () => {
        const generatedRoot = path.join(__dirname, '../../../test/generated');
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'canonical-lookup-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(
            specPath,
            `openapi: "3.0.0"
info:
  title: Lookup
  version: "1.0.0"
paths: {}
components:
  schemas:
    Foo:
      type: object
      properties:
        id:
          type: string
`,
            'utf8'
        );

        const { context } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const combined = `${specPath}${POINTER}`;
        const fromCombined = context.get(combined) as { type?: string };
        const fromParent = context.get(POINTER, specPath) as { type?: string };
        assert.equal(fromCombined?.type, 'object');
        assert.equal(fromParent?.type, 'object');
        assert.equal(context.exists(combined), true);
        assert.equal(context.exists(POINTER, specPath), true);
    });

    test('Output mapping keeps intern parser keys with backslashes under outputModels', () => {
        const output = getOutputPaths({ output: './generated' });
        const context = new Context({
            input: '/tmp/spec/api.yaml',
            output,
        });
        context.attachResolvedOpenApi(
            {
                values: () => ({}),
                paths: () => ['/tmp/spec/api.yaml', '\\tmp\\spec\\schemas\\User.yaml'],
                get: () => ({}),
                exists: () => true,
            },
            '/tmp/spec/api.yaml'
        );

        const result = context.map.resolve('/tmp/spec/schemas/User.yaml');
        assert.ok(result, 'expected virtual file for User.yaml');
        const outputFile = result!.outputFile.replace(/\\/g, '/');
        assert.ok(outputFile.startsWith(output.outputModels.replace(/\\/g, '/')), outputFile);
        assert.ok(outputFile.endsWith('/schemas/User.ts'), outputFile);
        assert.ok(!outputFile.includes('..'), outputFile);
    });
});
