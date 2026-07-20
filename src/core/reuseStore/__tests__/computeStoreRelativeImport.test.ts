import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';

import { computeStoreRelativeImport } from '../computeStoreRelativeImport';

describe('@unit: computeStoreRelativeImport', () => {
    test('produces ../ path from nested stub to shared canonical', () => {
        const stub = '/project/out/api-a/models/UserDto.ts';
        const canonical = '/project/out/__shared__/models/UserDto.ts';
        const result = computeStoreRelativeImport(stub, canonical);
        assert.equal(result, '../../__shared__/models/UserDto');
    });

    test('starts with ./ when canonical is in same directory', () => {
        const stub = '/project/out/models/UserDto.ts';
        const canonical = '/project/out/models/UserDtoCanonical.ts';
        const result = computeStoreRelativeImport(stub, canonical);
        assert.ok(result.startsWith('./'), `expected ./ prefix, got: ${result}`);
        assert.equal(result, './UserDtoCanonical');
    });

    test('strips .ts extension from result', () => {
        const stub = '/project/out/api-a/models/Foo.ts';
        const canonical = '/project/out/__shared__/models/Foo.ts';
        const result = computeStoreRelativeImport(stub, canonical);
        assert.ok(!result.endsWith('.ts'), 'result should not end with .ts');
    });

    test('handles deeply nested stub to shallow canonical', () => {
        const stub = '/a/b/c/d/stub.ts';
        const canonical = '/a/__shared__/canonical.ts';
        const result = computeStoreRelativeImport(stub, canonical);
        const expected = path.posix.relative('/a/b/c/d', '/a/__shared__/canonical').replace(/\\/g, '/');
        const normalized = expected.startsWith('.') ? expected : `./${expected}`;
        assert.equal(result, normalized);
    });
});
