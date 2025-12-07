import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Model } from '../../types/shared/Model.model';
import { getModelNames } from '../getModelNames';

describe('@unit: getModelNames', () => {
    test('should return sorted list', () => {
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

        assert.deepStrictEqual(getModelNames([]), []);
        assert.deepStrictEqual(getModelNames(models), ['Doe', 'Jane', 'John']);
    });
});
