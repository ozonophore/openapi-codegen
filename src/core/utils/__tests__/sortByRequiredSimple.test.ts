import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createOperationParameter } from '../__mocks__/createOperationParameter';
import { sortByRequiredSimple } from '../sortByRequiredSimple';

describe('sortByRequiredSimple', () => {
    test('@unit: должна помещать обязательные параметры без default перед необязательными', () => {
        const a = createOperationParameter('required', { isRequired: true });
        const b = createOperationParameter('optional', { isRequired: false });

        assert.strictEqual(sortByRequiredSimple(a, b), -1);
        assert.strictEqual(sortByRequiredSimple(b, a), 1);
    });

    test('@unit: должна считать равными два обязательных параметра без default', () => {
        const a = createOperationParameter('A', { isRequired: true });
        const b = createOperationParameter('B', { isRequired: true });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: должна считать равными два необязательных параметра', () => {
        const a = createOperationParameter('A', { isRequired: false });
        const b = createOperationParameter('B', { isRequired: false });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: должна помещать обязательные без default перед обязательными с default', () => {
        const a = createOperationParameter('required', { isRequired: true });
        const b = createOperationParameter('required-with-default', { isRequired: true, default: 'test' });

        assert.strictEqual(sortByRequiredSimple(a, b), -1);
        assert.strictEqual(sortByRequiredSimple(b, a), 1);
    });

    test('@unit: должна считать равными два обязательных параметра с default', () => {
        const a = createOperationParameter('A', { isRequired: true, default: 'a' });
        const b = createOperationParameter('B', { isRequired: true, default: 'b' });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: должна помещать обязательные без default перед необязательными с default', () => {
        const a = createOperationParameter('required', { isRequired: true });
        const b = createOperationParameter('optional-with-default', { isRequired: false, default: 'test' });

        assert.strictEqual(sortByRequiredSimple(a, b), -1);
        assert.strictEqual(sortByRequiredSimple(b, a), 1);
    });

    test('@unit: должна считать равными два необязательных параметра с default', () => {
        const a = createOperationParameter('A', { isRequired: false, default: 'a' });
        const b = createOperationParameter('B', { isRequired: false, default: 'b' });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: должна считать равными обязательный с default и необязательный без default', () => {
        const a = createOperationParameter('required-with-default', { isRequired: true, default: 'test' });
        const b = createOperationParameter('optional', { isRequired: false });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
        assert.strictEqual(sortByRequiredSimple(b, a), 0);
    });

    test('@unit: должна корректно работать с undefined значениями', () => {
        const a = createOperationParameter('required', { isRequired: true });
        const b = createOperationParameter('required-with-default', { isRequired: true, default: undefined });

        assert.strictEqual(sortByRequiredSimple(a, b), 0);
    });

    test('@unit: should sort params', () => {
        const optionalParameter = createOperationParameter('optional', { description: '3. Опциональный параметр без значения по умолчанию', isRequired: false });
        const optionalParameterWithDefault = createOperationParameter('optional-with-default', {
            description: '4. Опциональный параметр со значением по умолчанию',
            isRequired: false,
            default: 'Hello World!',
        });
        const requiredParameter = createOperationParameter('required', { description: '1. Обязательный параметр без значения по умолчанию', isRequired: true });
        const requiredParameterWithDefault = createOperationParameter('required-with-default', {
            description: '2. Обязательный параметр со значением по умолчанию',
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
