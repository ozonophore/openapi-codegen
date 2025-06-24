import assert from 'node:assert';
import { describe, test } from 'node:test';

import { Service } from '../../types/shared/Service.model';
import { sortServicesByName } from '../sortServicesByName';

describe('sortServicesByName', () => {
    test('@unit: should return sorted list', () => {
        const john: Service = {
            name: 'John',
            originName: 'JohnService',
            operations: [],
            imports: [],
        };
        const jane: Service = {
            name: 'Jane',
            originName: 'JaneService',
            operations: [],
            imports: [],
        };
        const doe: Service = {
            name: 'Doe',
            originName: 'DoeService',
            operations: [],
            imports: [],
        };

        const services: Service[] = [john, jane, doe];

        assert.deepStrictEqual(sortServicesByName([]), []);
        assert.deepStrictEqual(sortServicesByName(services), [doe, jane, john]);
    });
});
