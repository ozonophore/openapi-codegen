import assert from 'node:assert';
import { describe, mock, test } from 'node:test';

import { TypeRef } from '../../types/Enums';
import { getGatheringRefs } from '../getGatheringRefs';

const ContextMock = {
    get: (): any => undefined,
};

describe('gatheringRefs', () => {
    test('@unit: should handle nested $ref structures', () => {
        mock.method(ContextMock, 'get', (ref: string): any => {
            const mocks: Record<string, any> = {
                'models.yaml#/components/requestBodies/SimpleRequestBody': { $ref: '#/components/schemas/SimpleInteger' },
                'models.yaml#/components/schemas/SimpleInteger': { type: 'string' },
            };
            return mocks[ref] || null;
        });

        const object = { $ref: 'models.yaml#/components/requestBodies/SimpleRequestBody' };

        const references = getGatheringRefs(ContextMock as any, object, []);

        assert.deepStrictEqual(references, [
            { value: 'models.yaml#/components/requestBodies/SimpleRequestBody', type: TypeRef.OTHERS },
            { value: 'models.yaml#/components/schemas/SimpleInteger', type: TypeRef.OTHERS },
        ]);
    });
});
