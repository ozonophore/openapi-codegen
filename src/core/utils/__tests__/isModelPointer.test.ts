import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { isModelPointer, NON_MODEL_POINTER_PREFIXES } from '../isModelPointer';

describe('@unit: isModelPointer', () => {
    test('every denylist prefix is not a Model', () => {
        for (const prefix of NON_MODEL_POINTER_PREFIXES) {
            assert.equal(isModelPointer(`${prefix}ErrorResponse`), false, prefix);
        }
    });

    test('OAS3 schemas, OAS2 definitions, whole-file, and schema-document Pointers are Models', () => {
        assert.equal(isModelPointer('#/components/schemas/ErrorResponse'), true);
        assert.equal(isModelPointer('#/definitions/ErrorResponse'), true);
        assert.equal(isModelPointer(undefined), true);
        assert.equal(isModelPointer(''), true);
        assert.equal(isModelPointer('#/properties/first/properties/second/properties/nested'), true);
        assert.equal(isModelPointer('#/properties/prop'), true);
        assert.equal(isModelPointer('#/properties'), true);
    });
});
