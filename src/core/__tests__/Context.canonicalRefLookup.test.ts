import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { Context } from '../Context';
import { createResolvedContext } from '../createResolvedContext';
import { getOutputPaths } from '../utils/getOutputPaths';

const generatedRoot = path.join(__dirname, '../../../test/generated');
const WIN_FILE = 'C:/proj/api.yaml';
const WIN_POINTER = '#/components/schemas/Foo';
const WIN_CANONICAL = `${WIN_FILE}${WIN_POINTER}`;
const FOO_SCHEMA = { type: 'object', properties: { id: { type: 'string' } } };

function assertLookupKeyIntact(key: string) {
    assert.ok(!key.startsWith('/C:'), `lookup key must not prepend / to drive letter: ${key}`);
    assert.ok(!key.includes('#\\'), `lookup key must not destroy Pointer: ${key}`);
    assert.ok(key.includes(WIN_POINTER), `lookup key must keep Pointer ${WIN_POINTER}: ${key}`);
}

function createWindowsRefsDouble() {
    const getKeys: string[] = [];
    const existsKeys: string[] = [];

    const resolve = (key: string, bucket: string[]) => {
        bucket.push(key);
        if (key === WIN_FILE) {
            return { openapi: '3.0.0', components: { schemas: { Foo: FOO_SCHEMA } } };
        }
        if (key.includes(WIN_POINTER)) {
            assertLookupKeyIntact(key);
            return FOO_SCHEMA;
        }
        throw new Error(`unexpected $Refs key: ${key}`);
    };

    return {
        getKeys,
        existsKeys,
        refs: {
            values: () => ({}),
            paths: () => [WIN_FILE],
            get: (key: string) => resolve(key, getKeys),
            exists: (key: string) => {
                existsKeys.push(key);
                if (key === WIN_FILE) {
                    return true;
                }
                if (key.includes(WIN_POINTER)) {
                    assertLookupKeyIntact(key);
                    return true;
                }
                return false;
            },
        },
    };
}

function createWindowsContext() {
    const double = createWindowsRefsDouble();
    const context = new Context({
        input: WIN_FILE,
        output: getOutputPaths({ output: './generated' }),
        pathApi: path.win32,
    });
    context.attachResolvedOpenApi(double.refs, WIN_FILE);
    return { context, double };
}

describe('@unit: Context Canonical Ref lookup', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    test('get and exists resolve Windows Canonical Ref keys via path.win32 without mutating them', () => {
        const { context, double } = createWindowsContext();

        const fromCanonical = context.get(WIN_CANONICAL);
        const fromParent = context.get(WIN_POINTER, WIN_FILE);

        assert.deepEqual(fromCanonical, FOO_SCHEMA);
        assert.deepEqual(fromParent, FOO_SCHEMA);
        assert.equal(context.exists(WIN_CANONICAL), true);
        assert.equal(context.exists(WIN_POINTER, WIN_FILE), true);

        const lookupKeys = [...double.getKeys, ...double.existsKeys].filter(key => key.includes('#'));
        assert.ok(lookupKeys.length >= 4, 'Context.get/exists must call $Refs with fragment keys');
        for (const key of lookupKeys) {
            assertLookupKeyIntact(key);
        }
    });

    test('POSIX absolute path + Pointer still resolves through Context.get/exists', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'ctx-lookup-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(
            specPath,
            `openapi: "3.0.0"
info:
  title: Lookup
  version: "1.0.0"
paths:
  /example:
    get:
      responses:
        '200':
          description: ok
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Foo'
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

        const fromCanonical = context.get(`${specPath}#/components/schemas/Foo`);
        const fromParent = context.get('#/components/schemas/Foo', specPath);

        assert.equal((fromCanonical as { type?: string }).type, 'object');
        assert.deepEqual(fromCanonical, fromParent);
        assert.equal(context.exists(`${specPath}#/components/schemas/Foo`), true);
        assert.equal(context.exists('#/components/schemas/Foo', specPath), true);
    });
});
