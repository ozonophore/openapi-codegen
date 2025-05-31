import { TypeRef } from '../types/Enums';
import { getGatheringRefs } from './getGatheringRefs';

const Context = jest.fn();

Context.mockImplementation(() => {
    return {
        get: (ref: string): any => {
            const mocks: Record<string, any> = {
                'models.yaml#/components/requestBodies/SimpleRequestBody': { $ref: '#/components/schemas/SimpleInteger' },
                'models.yaml#/components/schemas/SimpleInteger': { type: 'string' },
            };
            return mocks[ref] || null;
        },
    };
});

describe('gatheringRefs', () => {
    it('should handle nested $ref structures', () => {
        const context = new Context();

        const object = { $ref: 'models.yaml#/components/requestBodies/SimpleRequestBody' };

        const references = getGatheringRefs(context, object, []);

        expect(references).toEqual([
            { value: 'models.yaml#/components/requestBodies/SimpleRequestBody', type: TypeRef.OTHERS },
            { value: 'models.yaml#/components/schemas/SimpleInteger', type: TypeRef.OTHERS },
        ]);
    });
});
