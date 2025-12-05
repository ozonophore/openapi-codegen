import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createOperationParameter } from '../__mocks__/createOperationParameter';
import { sortByRequiredSimple } from '../sortByRequiredSimple';

describe('sortByRequiredSimple', () => {
    test('@unit: must put required parameters without default before optional ones.', () => {
        const a = createOperationParameter('required', { isRequired: true });
        const b = createOperationParameter('optional', { isRequired: false });

        assert.strictEqual(sortByRequiredSimple(a, b), -1);
        assert.strictEqual(sortByRequiredSimple(b, a), 1);
    });

    test('@unit: it must consider two required parameters equal without default', () => {
        const a = createOperationParameter('A', { isRequired: true });
        const b = createOperationParameter('B', { isRequired: true });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: It must consider two optional parameters equal.', () => {
        const a = createOperationParameter('A', { isRequired: false });
        const b = createOperationParameter('B', { isRequired: false });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: must place the required ones without default before the required ones with default', () => {
        const a = createOperationParameter('required', { isRequired: true });
        const b = createOperationParameter('required-with-default', { isRequired: true, default: 'test' });

        assert.strictEqual(sortByRequiredSimple(a, b), -1);
        assert.strictEqual(sortByRequiredSimple(b, a), 1);
    });

    test('@unit: it must consider two required parameters with default equal.', () => {
        const a = createOperationParameter('A', { isRequired: true, default: 'a' });
        const b = createOperationParameter('B', { isRequired: true, default: 'b' });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: must place the required ones without default before the optional ones with default', () => {
        const a = createOperationParameter('required', { isRequired: true });
        const b = createOperationParameter('optional-with-default', { isRequired: false, default: 'test' });

        assert.strictEqual(sortByRequiredSimple(a, b), -1);
        assert.strictEqual(sortByRequiredSimple(b, a), 1);
    });

    test('@unit: it must consider two optional parameters with default equal.', () => {
        const a = createOperationParameter('A', { isRequired: false, default: 'a' });
        const b = createOperationParameter('B', { isRequired: false, default: 'b' });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: it should consider mandatory with default and optional without default to be equal', () => {
        const a = createOperationParameter('required-with-default', { isRequired: true, default: 'test' });
        const b = createOperationParameter('optional', { isRequired: false });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
        assert.strictEqual(sortByRequiredSimple(b, a), 0);
    });

    test('@unit: it must work correctly with undefined values.', () => {
        const a = createOperationParameter('required', { isRequired: true });
        const b = createOperationParameter('required-with-default', { isRequired: true, default: undefined });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: should sort params', () => {
        const optionalParameter = createOperationParameter('optional', { description: '3. Optional parameter with no default value', isRequired: false });
        const optionalParameterWithDefault = createOperationParameter('optional-with-default', {
            description: '4. An optional parameter with a default value',
            isRequired: false,
            default: 'Hello World!',
        });
        const requiredParameter = createOperationParameter('required', { description: '1. A required parameter without a default value', isRequired: true });
        const requiredParameterWithDefault = createOperationParameter('required-with-default', {
            description: '2. A required parameter with a default value',
            isRequired: true,
            default: 'Hello World!',
        });

        assert.deepStrictEqual([optionalParameterWithDefault, optionalParameter, requiredParameterWithDefault, requiredParameter].sort(sortByRequiredSimple), [
            requiredParameter,
            optionalParameterWithDefault,
            optionalParameter,
            requiredParameterWithDefault,
        ]);
    });
});
