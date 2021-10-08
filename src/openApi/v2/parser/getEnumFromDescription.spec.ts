import { getEnumFromDescription } from './getEnumFromDescription';

describe('getEnumFromDescription', () => {
    it('should return generic for template type', () => {
        const template = getEnumFromDescription('VALUE_1=1,VALUE_2=2');
        expect(template).toEqual(
            expect.arrayContaining([
                { name: 'VALUE_1', value: '1', type: 'number', description: null },
                { name: 'VALUE_2', value: '2', type: 'number', description: null },
            ])
        );
    });
});
