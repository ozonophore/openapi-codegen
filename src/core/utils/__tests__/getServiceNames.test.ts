import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Service } from '../../types/shared/Service.model';
import { getServiceNames } from '../getServiceNames';

describe('@unit: getServiceNames', () => {
    test('should return sorted list', () => {
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

        const services = [john, jane, doe];

        assert.deepStrictEqual(getServiceNames([]), []);
        assert.deepStrictEqual(getServiceNames(services), ['Doe', 'Jane', 'John']);
    });
});
