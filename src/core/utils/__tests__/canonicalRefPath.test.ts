import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';

import { normalizePath } from '../normalizePath';
import { normalizeRef } from '../normalizeRef';
import { parseRef, RefType } from '../parseRef';

const WIN_FILE = 'C:/proj/api.yaml';
const WIN_POINTER = '#/components/schemas/Foo';
const WIN_REF = `${WIN_FILE}${WIN_POINTER}`;

describe('@unit: canonical ref path helpers', () => {
    test('normalizePath does not prepend slash to a Windows drive letter', () => {
        assert.equal(normalizePath(WIN_FILE), WIN_FILE);
        assert.notEqual(normalizePath(WIN_FILE), `/${WIN_FILE}`);
    });

    test('parseRef with path.win32 keeps Pointer slashes', () => {
        const parsed = parseRef(WIN_REF, path.win32);
        assert.equal(parsed.type, RefType.ABSOLUTE_PATH);
        assert.equal(parsed.filePath, WIN_FILE);
        assert.equal(parsed.fragment, WIN_POINTER);
        assert.doesNotMatch(parsed.fragment ?? '', /#\\/);
    });

    test('normalizeRef with path.win32 does not turn Pointer into backslash form', () => {
        const combined = normalizeRef(WIN_REF, WIN_FILE, path.win32);
        const fromParent = normalizeRef(WIN_POINTER, WIN_FILE, path.win32);
        assert.equal(combined, WIN_REF);
        assert.equal(fromParent, WIN_REF);
        assert.doesNotMatch(combined, /#\\/);
        assert.doesNotMatch(fromParent, /#\\/);
        assert.doesNotMatch(combined, /^\/C:/);
    });

    test('POSIX parseRef / normalizeRef still resolve unix path + fragment', () => {
        const posixFile = '/tmp/proj/api.yaml';
        const posixRef = `${posixFile}${WIN_POINTER}`;
        const parsed = parseRef(posixRef, path.posix);
        assert.equal(parsed.type, RefType.ABSOLUTE_PATH);
        assert.equal(parsed.fragment, WIN_POINTER);
        assert.equal(normalizeRef(posixRef, posixFile, path.posix), posixRef);
        assert.equal(normalizeRef(WIN_POINTER, posixFile, path.posix), posixRef);
    });
});
