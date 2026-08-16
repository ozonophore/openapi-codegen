import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';

import { normalizePath } from '../normalizePath';
import { normalizeRef } from '../normalizeRef';
import { parseRef, RefType } from '../parseRef';

const WIN_FILE = 'C:/proj/api.yaml';
const WIN_POINTER = '#/components/schemas/Foo';
const WIN_CANONICAL = `${WIN_FILE}${WIN_POINTER}`;

function assertPointerIntact(value: string) {
    assert.ok(!value.includes('#\\'), `Pointer must not be rewritten with backslashes: ${value}`);
    assert.ok(value.includes(WIN_POINTER), `Pointer must remain ${WIN_POINTER}: ${value}`);
}

describe('@unit: Canonical Ref path helpers', () => {
    test('normalizePath does not prepend / to a Windows drive letter', () => {
        assert.equal(normalizePath('C:/proj/api.yaml'), 'C:/proj/api.yaml');
        assert.notEqual(normalizePath('C:/proj/api.yaml'), '/C:/proj/api.yaml');
        assert.equal(normalizePath('C:\\proj\\api.yaml'), 'C:/proj/api.yaml');
    });

    test('normalizePath still prefixes relative paths and keeps POSIX absolute', () => {
        assert.equal(normalizePath('proj/api.yaml'), '/proj/api.yaml');
        assert.equal(normalizePath('./proj/api.yaml'), './proj/api.yaml');
        assert.equal(normalizePath('/proj/api.yaml'), '/proj/api.yaml');
        assert.equal(normalizePath(''), '');
    });

    test('parseRef with path.win32 splits Pointer before classifying the source file', () => {
        const parsed = parseRef(WIN_CANONICAL, path.win32);
        assert.equal(parsed.type, RefType.ABSOLUTE_PATH);
        assert.equal(parsed.filePath, WIN_FILE);
        assert.equal(parsed.fragment, WIN_POINTER);
        assertPointerIntact(`${parsed.filePath}${parsed.fragment}`);
        assert.ok(!path.win32.normalize(parsed.filePath ?? '').includes('#'));
    });

    test('parseRef with path.win32 does not turn Pointer slashes into backslashes', () => {
        const parsed = parseRef(WIN_CANONICAL, path.win32);
        assert.notEqual(parsed.fragment, '#\\components\\schemas\\Foo');
        assert.equal(parsed.fragment, WIN_POINTER);
    });

    test('normalizeRef with path.win32 does not destroy Pointer or prepend /C:', () => {
        const fromAbsolute = normalizeRef(WIN_CANONICAL, WIN_FILE, path.win32);
        const fromFragment = normalizeRef(WIN_POINTER, WIN_FILE, path.win32);

        for (const result of [fromAbsolute, fromFragment]) {
            assert.ok(!result.startsWith('/C:'), `must not prepend / to drive letter: ${result}`);
            assertPointerIntact(result);
            assert.notEqual(result, `/C:/proj/api.yaml${WIN_POINTER}`);
        }
    });

    test('parseRef POSIX absolute file + Pointer still classifies as ABSOLUTE_PATH', () => {
        const parsed = parseRef('/proj/api.yaml#/components/schemas/Foo', path.posix);
        assert.equal(parsed.type, RefType.ABSOLUTE_PATH);
        assert.equal(parsed.filePath, '/proj/api.yaml');
        assert.equal(parsed.fragment, '#/components/schemas/Foo');
    });

    test('parseRef local Pointer and relative file keep existing types', () => {
        assert.equal(parseRef('#/components/schemas/Foo').type, RefType.LOCAL_FRAGMENT);
        assert.equal(parseRef('./models.yaml').type, RefType.EXTERNAL_FILE);
        assert.equal(parseRef('./models.yaml#/components/schemas/Foo').type, RefType.EXTERNAL_FILE_FRAGMENT);
        assert.equal(parseRef('https://example.com/api.yaml#/components/schemas/Foo').type, RefType.HTTP_URL);
    });
});
