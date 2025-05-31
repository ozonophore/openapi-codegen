import type { Service } from '../types/shared/Service.model';
import { sort } from './sort';

export function getServiceNames(services: Service[]): string[] {
    return services.map(service => service.name).sort(sort);
}
