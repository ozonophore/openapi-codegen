import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Model } from '../../types/shared/Model.model';
import { sortModelsByName } from '../sortModelsByName';

describe('@unit: sortModelsByName', () => {
    test('should return sorted list', () => {
        const john: Model = {
            alias: '',
            path: '',
            export: 'interface',
            name: 'John',
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

        assert.deepStrictEqual(sortModelsByName([]), []);
        assert.deepStrictEqual(sortModelsByName(models), [doe, jane, john]);
    });
});
