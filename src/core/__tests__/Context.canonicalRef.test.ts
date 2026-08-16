import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';

import { Context } from '../Context';
import { getOutputPaths } from '../utils/getOutputPaths';

const SCHEMA = { type: 'object', properties: { id: { type: 'string' } } };
const WIN_FILE = 'C:/proj/api.yaml';
const WIN_POINTER = '#/components/schemas/Foo';
const WIN_REF = `${WIN_FILE}${WIN_POINTER}`;
const POSIX_FILE = '/tmp/proj/api.yaml';
const POSIX_REF = `${POSIX_FILE}${WIN_POINTER}`;

function createRecordingRefs() {
    const getKeys: string[] = [];
    const existsKeys: string[] = [];
    const refs = {
        values: () => ({}),
        paths: () => [] as string[],
        get: (key: string) => {
            getKeys.push(key);
            if (!key.includes('#')) {
                return { openapi: '3.0.0', paths: {}, components: { schemas: { Foo: SCHEMA } } };
            }
            return SCHEMA;
        },
        exists: (key: string) => {
            existsKeys.push(key);
            return true;
        },
    };
    return { refs, getKeys, existsKeys };
}

function assertLookupKey(key: string, expected: string) {
    assert.equal(key, expected);
    assert.notEqual(key, `/${expected.replace(/^\//, '')}`);
    assert.doesNotMatch(key, /^\/[A-Za-z]:/);
    assert.doesNotMatch(key, /#\\/);
}

describe('@unit: Context Canonical Ref lookup', () => {
    test('get/exists with Windows keys via path.win32 do not mutate the lookup key', () => {
        const { refs, getKeys, existsKeys } = createRecordingRefs();
        const context = new Context({
            input: WIN_FILE,
            output: getOutputPaths({ output: './generated' }),
            pathApi: path.win32,
        });
        context.attachResolvedOpenApi(refs, WIN_FILE);

        const fromCombined = context.get(WIN_REF);
        const combinedGetKey = getKeys[getKeys.length - 1];
        assert.deepEqual(fromCombined, SCHEMA);
        assertLookupKey(combinedGetKey, WIN_REF);

        const fromParent = context.get(WIN_POINTER, WIN_FILE);
        const parentGetKey = getKeys[getKeys.length - 1];
        assert.deepEqual(fromParent, SCHEMA);
        assertLookupKey(parentGetKey, WIN_REF);

        assert.equal(context.exists(WIN_REF), true);
        assertLookupKey(existsKeys[existsKeys.length - 1], WIN_REF);
        assert.equal(context.exists(WIN_POINTER, WIN_FILE), true);
        assertLookupKey(existsKeys[existsKeys.length - 1], WIN_REF);
    });

    test('POSIX unix path + fragment still resolves through get/exists', () => {
        const { refs, getKeys, existsKeys } = createRecordingRefs();
        const context = new Context({
            input: POSIX_FILE,
            output: getOutputPaths({ output: './generated' }),
            pathApi: path.posix,
        });
        context.attachResolvedOpenApi(refs, POSIX_FILE);

        assert.deepEqual(context.get(POSIX_REF), SCHEMA);
        assert.equal(getKeys[getKeys.length - 1], POSIX_REF);
        assert.deepEqual(context.get(WIN_POINTER, POSIX_FILE), SCHEMA);
        assert.equal(getKeys[getKeys.length - 1], POSIX_REF);
        assert.equal(context.exists(POSIX_REF), true);
        assert.equal(existsKeys[existsKeys.length - 1], POSIX_REF);
        assert.equal(context.exists(WIN_POINTER, POSIX_FILE), true);
        assert.equal(existsKeys[existsKeys.length - 1], POSIX_REF);
    });
});
