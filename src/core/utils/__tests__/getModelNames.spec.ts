import type { Model } from '../client/interfaces/Model';
import { getModelNames } from './getModelNames';

describe('getModelNames', () => {
    it('should return sorted list', () => {
        const john: Model = {
            path: '',
            export: 'interface',
            name: 'John',
            alias: '',
            type: 'John',
            base: 'John',
            template: null,
            link: null,
            description: null,
            isDefinition: true,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
        };
        const jane: Model = {
            alias: '',
            path: '',
            export: 'interface',
            name: 'Jane',
            type: 'Jane',
            base: 'Jane',
            template: null,
            link: null,
            description: null,
            isDefinition: true,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
        };
        const doe: Model = {
            alias: '',
            path: '',
            export: 'interface',
            name: 'Doe',
            type: 'Doe',
            base: 'Doe',
            template: null,
            link: null,
            description: null,
            isDefinition: true,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
        };
        const models: Model[] = [john, jane, doe];

        expect(getModelNames([])).toEqual([]);
        expect(getModelNames(models)).toEqual(['Doe', 'Jane', 'John']);
    });
});
