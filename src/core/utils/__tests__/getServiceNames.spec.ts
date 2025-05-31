import type { Service } from '../client/interfaces/Service';
import { getServiceNames } from './getServiceNames';

describe('getServiceNames', () => {
    it('should return sorted list', () => {
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

        expect(getServiceNames([])).toEqual([]);
        expect(getServiceNames(services)).toEqual(['Doe', 'Jane', 'John']);
    });
});
