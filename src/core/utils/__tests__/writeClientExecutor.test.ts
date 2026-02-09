import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Service } from '../../types/shared/Service.model';
import { deduplicateServicesByName } from '../writeClientExecutor';

describe('@unit: writeClientExecutor', () => {
    test('deduplicateServicesByName should keep first service by name', () => {
        const services: Service[] = [
            { name: 'V2Service', originName: 'V2Service', operations: [], imports: [] },
            { name: 'V2Service', originName: 'V2ServiceCopy', operations: [], imports: [] },
            { name: 'SimpleService', originName: 'SimpleService', operations: [], imports: [] },
        ];

        const result = deduplicateServicesByName(services);

        assert.deepStrictEqual(result.map(item => item.name), ['V2Service', 'SimpleService']);
        assert.equal(result[0].originName, 'V2Service');
    });
});
