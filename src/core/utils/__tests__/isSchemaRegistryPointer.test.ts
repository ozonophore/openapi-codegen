import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { isSchemaRegistryPointer } from '../isSchemaRegistryPointer';

describe('@unit: isSchemaRegistryPointer', () => {
    test('missing or empty Pointer is a Model (whole-file identity)', () => {
        assert.equal(isSchemaRegistryPointer(undefined), true);
        assert.equal(isSchemaRegistryPointer(''), true);
    });

    test('OAS3 schemas and OAS2 definitions are Models', () => {
        assert.equal(isSchemaRegistryPointer('#/components/schemas/ErrorResponse'), true);
        assert.equal(isSchemaRegistryPointer('#/definitions/ErrorResponse'), true);
    });

    test('Response / Parameter / Header / Request Body Pointers are not Models', () => {
        assert.equal(isSchemaRegistryPointer('#/components/responses/ErrorResponse'), false);
        assert.equal(isSchemaRegistryPointer('#/components/parameters/ErrorResponse'), false);
        assert.equal(isSchemaRegistryPointer('#/components/headers/ErrorResponse'), false);
        assert.equal(isSchemaRegistryPointer('#/components/requestBodies/ErrorResponse'), false);
        assert.equal(isSchemaRegistryPointer('#/responses/ErrorResponse'), false);
        assert.equal(isSchemaRegistryPointer('#/parameters/ErrorResponse'), false);
    });
});
