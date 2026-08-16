import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { isModelCanonicalRef, isModelPointer, NON_MODEL_POINTER_PREFIXES, splitCanonicalRef } from '../canonicalRef';
import { stripNamespace } from '../stripNamespace';

const OAS3_DENYLIST = [
    '#/components/responses/',
    '#/components/parameters/',
    '#/components/headers/',
    '#/components/requestBodies/',
    '#/components/examples/',
    '#/components/securitySchemes/',
    '#/components/links/',
    '#/components/callbacks/',
    '#/components/pathItems/',
] as const;

const OAS2_DENYLIST = ['#/responses/', '#/parameters/', '#/securityDefinitions/'] as const;

const EXPECTED_DENYLIST = [...OAS3_DENYLIST, ...OAS2_DENYLIST];

describe('@unit: isModelPointer denylist', () => {
    test('exported denylist is the full non-schema registry set', () => {
        assert.deepEqual([...NON_MODEL_POINTER_PREFIXES], [...EXPECTED_DENYLIST]);
        const denylist = new Set<string>(NON_MODEL_POINTER_PREFIXES);
        assert.equal(denylist.has('#/components/schemas/'), false);
        assert.equal(denylist.has('#/definitions/'), false);
    });

    test('each OAS3 non-schema registry Pointer is not a Model', () => {
        for (const prefix of OAS3_DENYLIST) {
            assert.equal(isModelPointer(`${prefix}Foo`), false, `pointer-only ${prefix}`);
            const { pointer } = splitCanonicalRef(`/tmp/api.yaml${prefix}Foo`);
            assert.equal(isModelPointer(pointer), false, `file+pointer ${prefix}`);
        }
    });

    test('each OAS2 non-schema registry Pointer is not a Model', () => {
        for (const prefix of OAS2_DENYLIST) {
            assert.equal(isModelPointer(`${prefix}Foo`), false, `pointer-only ${prefix}`);
            const { pointer } = splitCanonicalRef(`/tmp/api.yaml${prefix}Foo`);
            assert.equal(isModelPointer(pointer), false, `file+pointer ${prefix}`);
        }
    });

    test('OAS 3.1 #/components/pathItems/ is not a Model', () => {
        assert.equal(isModelPointer('#/components/pathItems/Users'), false);
        assert.equal(isModelPointer(splitCanonicalRef('/tmp/api.yaml#/components/pathItems/Users').pointer), false);
        assert.equal(isModelCanonicalRef('/tmp/api.yaml#/components/pathItems/Users'), false);
    });
});

describe('@unit: isModelPointer allow-through', () => {
    test('Schema registry, whole-file, and schema-document Pointers are Models', () => {
        assert.equal(isModelPointer(undefined), true);
        assert.equal(isModelPointer(''), true);
        assert.equal(isModelPointer(splitCanonicalRef('/tmp/api.yaml').pointer), true);
        assert.equal(isModelPointer('#/components/schemas/Foo'), true);
        assert.equal(isModelPointer('#/definitions/Foo'), true);
        assert.equal(isModelPointer('#/properties'), true);
        assert.equal(isModelPointer('#/properties/nested'), true);
        assert.equal(isModelPointer('#/properties/first/properties/second'), true);
        assert.equal(isModelPointer('#/items'), true);
        assert.equal(isModelPointer('#/allOf/0'), true);
        assert.equal(isModelCanonicalRef('/tmp/api.yaml'), true);
        assert.equal(isModelCanonicalRef('/tmp/api.yaml#/components/schemas/Foo'), true);
    });

    test('stripNamespace names both schema and requestBodies; is-Model does not', () => {
        assert.equal(stripNamespace('#/components/schemas/Item'), 'Item');
        assert.equal(stripNamespace('#/components/requestBodies/Item'), 'Item');
        assert.equal(isModelPointer('#/components/schemas/Item'), true);
        assert.equal(isModelPointer('#/components/requestBodies/Item'), false);
    });

    test('allowlist of schema registries would drop #/properties/nested; denylist keeps it', () => {
        const nestedRef = 'schemas/compositions/ModelWithNestedProperties.yml#/properties/first/properties/second/properties/nested';
        const { pointer } = splitCanonicalRef(nestedRef);
        const schemaAllowlist = ['#/components/schemas/', '#/definitions/'] as const;
        const allowlistWouldAccept = schemaAllowlist.some(prefix => pointer?.startsWith(prefix));
        assert.equal(allowlistWouldAccept, false);
        assert.equal(isModelPointer(pointer), true);
    });
});
