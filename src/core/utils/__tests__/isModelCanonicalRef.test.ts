import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { isModelCanonicalRef, NON_MODEL_POINTER_PREFIXES } from '../isModelCanonicalRef';

const SCHEMA_REGISTRY_ALLOWLIST = ['#/components/schemas/', '#/definitions/'] as const;

function allowlistWouldAccept(canonicalRef: string): boolean {
    const hashIndex = canonicalRef.indexOf('#');
    if (hashIndex === -1) {
        return true;
    }
    const pointer = canonicalRef.slice(hashIndex);
    return SCHEMA_REGISTRY_ALLOWLIST.some(prefix => pointer.startsWith(prefix));
}

describe('@unit: isModelCanonicalRef denylist', () => {
    test('denylist Pointer prefixes are not Models', () => {
        for (const prefix of NON_MODEL_POINTER_PREFIXES) {
            assert.equal(isModelCanonicalRef(`${prefix}ErrorResponse`), false, prefix);
            assert.equal(isModelCanonicalRef(`/tmp/api.yaml${prefix}ErrorResponse`), false, prefix);
        }
    });

    test('schemas, definitions, whole-file, and schema-document Pointers are Models', () => {
        assert.equal(isModelCanonicalRef('#/components/schemas/ErrorResponse'), true);
        assert.equal(isModelCanonicalRef('/tmp/api.yaml#/components/schemas/ErrorResponse'), true);
        assert.equal(isModelCanonicalRef('#/definitions/ErrorResponse'), true);
        assert.equal(isModelCanonicalRef('schemas/base/ModelWithString.yml'), true);
        assert.equal(isModelCanonicalRef('C:/proj/schemas/base/ModelWithString.yml'), true);
        assert.equal(isModelCanonicalRef('schemas/compositions/ModelWithNestedProperties.yml#/properties/first/properties/second/properties/nested'), true);
        assert.equal(isModelCanonicalRef('schemas/collections/ModelWithArrayExtended.yml#/properties/prop'), true);
        assert.equal(isModelCanonicalRef('schemas/compositions/ModelWithDictionaryExtended.yml#/properties'), true);
    });

    test('allowlist would have dropped #/properties/nested; denylist keeps it', () => {
        const nestedRef = 'schemas/compositions/ModelWithNestedProperties.yml#/properties/first/properties/second/properties/nested';
        assert.equal(allowlistWouldAccept(nestedRef), false);
        assert.equal(isModelCanonicalRef(nestedRef), true);
    });
});
