import type { Service } from '../types/shared/Service.model';

export function sortServicesByName(services: Service[]): Service[] {
    return services.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}
