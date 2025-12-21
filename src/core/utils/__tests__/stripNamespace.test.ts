import assert from 'node:assert';
import { describe, test } from 'node:test';

import { stripNamespace } from '../stripNamespace';

describe('@unit: stripNamespace', () => {
    test('should strip namespace', () => {
        assert.strictEqual(stripNamespace('package/componentClass.yml#/components/TestComponent'), 'package/TestComponent');
        assert.strictEqual(stripNamespace('package/componentClass.yml'), 'package/ComponentClass');
        assert.strictEqual(stripNamespace('#/components/schemas/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/components/responses/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/components/parameters/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/components/examples/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/components/requestBodies/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/components/headers/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/components/securitySchemes/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/components/links/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/components/callbacks/Item'), 'Item');
        assert.strictEqual(stripNamespace('/components/callbacks/item'), '/components/callbacks/Item');
        assert.strictEqual(stripNamespace('/components/callbacks/some_special_item'), '/components/callbacks/SomeSpecialItem');
        assert.strictEqual(stripNamespace('#/definitions/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/parameters/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/responses/Item'), 'Item');
        assert.strictEqual(stripNamespace('#/securityDefinitions/Item'), 'Item');
    });
});
