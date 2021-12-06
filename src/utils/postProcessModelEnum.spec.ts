import { Model } from '../client/interfaces/Model';
import { postProcessModelEnum } from './postProcessModelEnum';

describe('postProcessModelEnum', () => {
    it('should return correct enum', () => {
        const model: Model = {
            description: '',
            isDefinition: false,
            isNullable: false,
            isReadOnly: false,
            isRequired: false,
            link: null,
            template: null,
            name: 'Name',
            alias: 'Alias',
            path: './distr',
            export: 'reference',
            type: 'Type',
            base: 'TypeBase',
            imports: [],
            enum: [
                {
                    name: 'Enum1',
                    value: 'Enum1',
                    type: 'string',
                    description: null,
                },
            ],
            enums: [],
            properties: [],
        };
        const enums = postProcessModelEnum(model);
        expect(enums.length).toEqual(1);
        expect(enums).toEqual([
            {
                name: 'Enum1',
                value: 'Enum1',
                type: 'string',
                description: null,
            },
        ]);
    });
});
