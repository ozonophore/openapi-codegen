import type { Model } from '../types/shared/Model.model';

export function sortModelsByName(models: Model[]): Model[] {
    return models.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}
