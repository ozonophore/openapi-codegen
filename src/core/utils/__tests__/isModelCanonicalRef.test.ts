import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { isModelCanonicalRef } from '../parseRef';

const DENYLIST_PREFIXES = [
    '#/components/responses/',
    '#/components/parameters/',
    '#/components/headers/',
    '#/components/requestBodies/',
    '#/components/examples/',
    '#/components/securitySchemes/',
    '#/components/links/',
    '#/components/callbacks/',
    '#/responses/',
    '#/parameters/',
    '#/securityDefinitions/',
] as const;

const MODEL_POINTERS = [
    '#/components/schemas/ErrorResponse',
    '#/definitions/ErrorResponse',
    '#/properties',
    '#/properties/first',
    '#/properties/first/properties/second',
    '#/items',
    '#/allOf/0',
    '#/allOf/1/properties/propExtendsA',
] as const;

describe('@unit: isModelCanonicalRef denylist', () => {
    test('every non-schema component registry prefix is not a Model', () => {
        for (const prefix of DENYLIST_PREFIXES) {
            const pointer = `${prefix}ErrorResponse`;
            assert.equal(isModelCanonicalRef(pointer), false, pointer);
            assert.equal(isModelCanonicalRef(`/tmp/api.yaml${pointer}`), false, `/tmp/api.yaml${pointer}`);
            assert.equal(isModelCanonicalRef(`C:/proj/api.yaml${pointer}`), false, `C:/proj/api.yaml${pointer}`);
        }
    });

    test('schema registry, whole-file, and schema-document Pointers are Models', () => {
        assert.equal(isModelCanonicalRef('/tmp/schemas/ModelWithString.yml'), true);
        assert.equal(isModelCanonicalRef('C:/proj/schemas/ModelWithString.yml'), true);
        assert.equal(isModelCanonicalRef('schemas/base/ModelWithString.yml'), true);

        for (const pointer of MODEL_POINTERS) {
            assert.equal(isModelCanonicalRef(pointer), true, pointer);
            assert.equal(isModelCanonicalRef(`/tmp/api.yaml${pointer}`), true, `/tmp/api.yaml${pointer}`);
        }
    });
});
