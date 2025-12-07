import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getAbsolutePath } from '../getAbsolutePath';

describe('@unit: getAbsolutePath', () => {
    test('The absolute reference in the definition Ref replaces the part after the # in the parentRef', () => {
        const result = getAbsolutePath('#/components/schemas/ErrorCode', 'models.yaml#/components/schemas/ErrorData');
        assert.strictEqual(result, 'models.yaml#/components/schemas/ErrorCode');
    });

    test('The absolute parentRef reference returns the definition Ref as it is', () => {
        const result = getAbsolutePath('relative/path', '#/components/schemas/ErrorData');
        assert.strictEqual(result, 'relative/path');
    });

    test('The relative path is combined with the directory', () => {
        const result = getAbsolutePath('relative/path', 'models.yaml#/components/schemas/ErrorData');
        assert.strictEqual(result, 'relative/path');
    });

    test('If definitionRef is missing and parentRef starts with #/, an empty string is returned.', () => {
        const result = getAbsolutePath(undefined, '#/components/schemas/ErrorData');
        assert.strictEqual(result, '');
    });

    test('If the definition Ref is missing, parentRef is returned.', () => {
        const result = getAbsolutePath(undefined, 'models.yaml#/components/schemas/ErrorData');
        assert.strictEqual(result, 'models.yaml#/components/schemas/ErrorData');
    });
});
