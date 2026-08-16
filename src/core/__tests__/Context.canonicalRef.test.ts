import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { withPathAdapter } from '../../common/utils/pathAdapter';
import { Context } from '../Context';
import { createResolvedContext } from '../createResolvedContext';
import { getOutputPaths } from '../utils/getOutputPaths';

const generatedRoot = path.join(__dirname, '../../../test/generated');

const WINDOWS_SOURCE_FILE = 'C:/proj/api.yaml';
const SCHEMA_POINTER = '#/components/schemas/Foo';
const WINDOWS_CANONICAL_REF = `${WINDOWS_SOURCE_FILE}${SCHEMA_POINTER}`;

const schemaObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
    },
};

function isMutatedWindowsLookupKey(key: string): boolean {
    return key.startsWith('/C:') || key.includes('/C:/') || key.includes('#\\');
}

function createWindowsRefsDouble() {
    const getKeys: string[] = [];
    const existsKeys: string[] = [];

    const refs = {
        values: () => ({}),
        paths: () => [] as string[],
        get: (key: string) => {
            getKeys.push(key);
            if (key.includes(SCHEMA_POINTER) && !isMutatedWindowsLookupKey(key)) {
                return schemaObject;
            }
            return { openapi: '3.0.0' };
        },
        exists: (key: string) => {
            existsKeys.push(key);
            return key.includes(SCHEMA_POINTER) && !isMutatedWindowsLookupKey(key);
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

    test('get and exists resolve Windows Canonical Ref keys via win32 path adapter', () => {
        withPathAdapter(path.win32, () => {
            const { refs, getKeys, existsKeys } = createWindowsRefsDouble();
            const context = new Context({
                input: WINDOWS_SOURCE_FILE,
                output: getOutputPaths({ output: './generated' }),
                pathAdapter: path.win32,
            });
            context.attachResolvedOpenApi(refs, WINDOWS_SOURCE_FILE);

            const byCombined = context.get(WINDOWS_CANONICAL_REF);
            const byParent = context.get(SCHEMA_POINTER, WINDOWS_SOURCE_FILE);

            assert.deepEqual(byCombined, schemaObject);
            assert.deepEqual(byParent, schemaObject);
            assert.equal(context.exists(WINDOWS_CANONICAL_REF), true);
            assert.equal(context.exists(SCHEMA_POINTER, WINDOWS_SOURCE_FILE), true);

            const lookupKeys = [...getKeys, ...existsKeys].filter(key => key.includes('#'));
            assert.ok(lookupKeys.length > 0);
            for (const key of lookupKeys) {
                assert.equal(isMutatedWindowsLookupKey(key), false, `lookup key was mutated: ${key}`);
                assert.ok(key.endsWith(SCHEMA_POINTER), `Pointer destroyed in key: ${key}`);
            }
        });
    });

    test('POSIX path + fragment still resolves through Context.get and exists', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'canonical-ref-posix-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(
            specPath,
            `openapi: "3.0.0"
info:
  title: Mini
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

        const combined = `${specPath}${SCHEMA_POINTER}`;
        const byCombined = context.get(combined) as { type?: string; properties?: { id?: unknown } };
        const byParent = context.get(SCHEMA_POINTER, specPath) as { type?: string; properties?: { id?: unknown } };

        assert.equal(byCombined?.type, 'object');
        assert.ok(byCombined?.properties?.id);
        assert.equal(byParent?.type, 'object');
        assert.ok(byParent?.properties?.id);
        assert.equal(context.exists(combined), true);
        assert.equal(context.exists(SCHEMA_POINTER, specPath), true);
    });
});
