import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { RefLookup, RefLookupError } from '../refLookup';

const POINTER = '#/components/schemas/Foo';
const POSIX_ENTRY = '/home/dev/api.yaml';
const POSIX_OWNER = '/home/dev/schemas/Owner.yaml';
const POSIX_PET = '/home/dev/schemas/Pet.yaml';
const POSIX_COMMON = '/home/dev/common.yaml';
const WINDOWS_FILE = 'C:/proj/api.yaml';
const WINDOWS_OWNER = 'C:/proj/schemas/Owner.yaml';
const WINDOWS_PET = 'C:/proj/schemas/Pet.yaml';

describe('@unit: RefLookup', () => {
    test('pointer-only with parent keeps Pointer slashes', () => {
        const lookup = new RefLookup([POSIX_ENTRY], POSIX_ENTRY);
        const result = lookup.toCanonicalRef(POINTER, POSIX_ENTRY);
        assert.equal(result, `${POSIX_ENTRY}${POINTER}`);
        assert.ok(!result.includes('#\\'));
    });

    test('pointer-only without parent uses Entry file', () => {
        const lookup = new RefLookup([POSIX_ENTRY], POSIX_ENTRY);
        assert.equal(lookup.toCanonicalRef(POINTER), `${POSIX_ENTRY}${POINTER}`);
    });

    test('relative file from parent directory joins as sibling', () => {
        const lookup = new RefLookup([POSIX_OWNER, POSIX_PET], POSIX_ENTRY);
        assert.equal(lookup.toCanonicalRef('Pet.yaml', POSIX_OWNER), POSIX_PET);
        assert.equal(lookup.toCanonicalRef('./Pet.yaml', POSIX_OWNER), POSIX_PET);
    });

    test('relative file with parent up-segment', () => {
        const lookup = new RefLookup([POSIX_OWNER, POSIX_COMMON], POSIX_ENTRY);
        assert.equal(lookup.toCanonicalRef('../common.yaml#/defs/X', POSIX_OWNER), `${POSIX_COMMON}#/defs/X`);
    });

    test('relative file keeps repeated folder names in the absolute path', () => {
        const parent = '/home/runner/work/openapi-codegen/openapi-codegen/test/spec/v3.withDifferentRefs.yml';
        const target = '/home/runner/work/openapi-codegen/openapi-codegen/test/spec/schemas/base/ModelWithString.yml';
        const lookup = new RefLookup([parent, target], parent);
        assert.equal(lookup.toCanonicalRef('schemas/base/ModelWithString.yml', parent), target);
    });

    test('Windows C:/ paths join via URL on any host OS', () => {
        const lookup = new RefLookup([WINDOWS_FILE, WINDOWS_OWNER, WINDOWS_PET], WINDOWS_FILE);
        assert.equal(lookup.toCanonicalRef('Pet.yaml', WINDOWS_OWNER), WINDOWS_PET);
        assert.equal(lookup.toCanonicalRef('./schemas/Pet.yaml', WINDOWS_FILE), WINDOWS_PET);
        assert.equal(lookup.toCanonicalRef(POINTER, WINDOWS_FILE), `${WINDOWS_FILE}${POINTER}`);
    });

    test('intern matches backslash Tree $ref to parser forward-slash key', () => {
        const lookup = new RefLookup([WINDOWS_FILE], WINDOWS_FILE);
        assert.equal(lookup.toCanonicalRef('C:\\proj\\api.yaml#/components/schemas/Foo'), `${WINDOWS_FILE}${POINTER}`);
        assert.equal(lookup.internExact('C:\\proj\\api.yaml'), WINDOWS_FILE);
        assert.equal(lookup.internExact('c:/proj/api.yaml'), WINDOWS_FILE);
    });

    test('relative Tree $ref without parent is a contract error', () => {
        const lookup = new RefLookup([POSIX_ENTRY, POSIX_PET], POSIX_ENTRY);
        assert.throws(() => lookup.toCanonicalRef('./Pet.yaml'), RefLookupError);
        assert.throws(() => lookup.toCanonicalRef('Pet.yaml'), /Parent source file/);
    });

    test('parent with Pointer is a contract error', () => {
        const lookup = new RefLookup([POSIX_ENTRY], POSIX_ENTRY);
        assert.throws(() => lookup.toCanonicalRef(POINTER, `${POSIX_ENTRY}${POINTER}`), /must not include a Pointer/);
    });

    test('relative parent is a contract error', () => {
        const lookup = new RefLookup([POSIX_ENTRY], POSIX_ENTRY);
        assert.throws(() => lookup.toCanonicalRef('Pet.yaml', './Owner.yaml'), /absolute path/);
    });

    test('file not in intern table is not rewritten to another Pet.yaml', () => {
        const otherPet = '/home/dev/other/Pet.yaml';
        const lookup = new RefLookup([POSIX_ENTRY, otherPet], POSIX_ENTRY);
        const result = lookup.toCanonicalRef('Pet.yaml', POSIX_OWNER);
        assert.equal(result, POSIX_PET);
        assert.equal(lookup.internExact(POSIX_PET), undefined);
        assert.notEqual(result, otherPet);
    });

    test('remote $ref is returned as authored', () => {
        const lookup = new RefLookup([POSIX_ENTRY], POSIX_ENTRY);
        const remote = 'https://ex.com/a.json#/Foo';
        assert.equal(lookup.toCanonicalRef(remote, POSIX_ENTRY), remote);
        assert.equal(lookup.toCanonicalRef(remote), remote);
    });

    test('percent-encoding in intern comparison', () => {
        const spaced = '/home/dev/foo bar.yaml';
        const lookup = new RefLookup([spaced], POSIX_ENTRY);
        assert.equal(lookup.toCanonicalRef('/home/dev/foo%20bar.yaml'), spaced);
    });
});
