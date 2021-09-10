import { getDefinition } from './getDefinition';

describe('getDefinition', () => {
    it('should return object by $ref', () => {
        const $ref = '#/component/item';
        const expectedObject = {
            property: 'Test',
        };
        const object = {
            component: {
                item: expectedObject,
            },
        };
        expect(getDefinition($ref, object)).toEqual(expectedObject);
    });
});
