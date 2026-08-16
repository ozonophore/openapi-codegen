import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';

import { normalizePath } from '../normalizePath';
import { normalizeRef } from '../normalizeRef';
import { parseRef, RefType } from '../parseRef';

const WINDOWS_CANONICAL_REF = 'C:/proj/api.yaml#/components/schemas/Foo';
const WINDOWS_SOURCE_FILE = 'C:/proj/api.yaml';
const SCHEMA_POINTER = '#/components/schemas/Foo';

describe('@unit: Canonical Ref path helpers', () => {
    test('normalizePath does not prepend / to a Windows drive letter', () => {
        assert.notEqual(normalizePath('C:/proj/api.yaml'), '/C:/proj/api.yaml');
        assert.equal(normalizePath('C:/proj/api.yaml'), 'C:/proj/api.yaml');
        assert.notEqual(normalizePath('C:/proj/api.yaml', path.win32), '/C:/proj/api.yaml');
    });

    test('parseRef with win32 does not destroy the Pointer', () => {
        const destroyedByRawNormalize = path.win32.normalize(WINDOWS_CANONICAL_REF);
        assert.ok(destroyedByRawNormalize.includes('#\\'), 'documents why path APIs must not see file#pointer');

        const parsed = parseRef(WINDOWS_CANONICAL_REF, path.win32);
        assert.equal(parsed.type, RefType.ABSOLUTE_PATH);
        assert.equal(parsed.filePath, WINDOWS_SOURCE_FILE);
        assert.equal(parsed.fragment, SCHEMA_POINTER);
        assert.ok(!parsed.fragment?.includes('\\'));
    });

    test('normalizeRef with win32 does not destroy the Pointer or prepend /C:', () => {
        const result = normalizeRef(WINDOWS_CANONICAL_REF, WINDOWS_SOURCE_FILE, path.win32);
        assert.ok(!result.includes('#\\'));
        assert.ok(!result.startsWith('/C:'));
        assert.ok(!result.includes('/C:/'));
        assert.ok(result.endsWith(SCHEMA_POINTER));
        assert.equal(result, WINDOWS_CANONICAL_REF);
    });

    test('POSIX path + fragment still parses and normalizes', () => {
        const posixRef = '/tmp/proj/api.yaml#/components/schemas/Foo';
        const parsed = parseRef(posixRef, path.posix);
        assert.equal(parsed.type, RefType.ABSOLUTE_PATH);
        assert.equal(parsed.filePath, '/tmp/proj/api.yaml');
        assert.equal(parsed.fragment, SCHEMA_POINTER);

        const normalized = normalizeRef(posixRef, '/tmp/proj/api.yaml', path.posix);
        assert.equal(normalized, posixRef);
        assert.ok(!normalized.includes('#\\'));
    });
});
