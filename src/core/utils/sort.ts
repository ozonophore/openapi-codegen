import { Import } from '../types/shared/Import.model';

function sortString(a: string, b: string): number {
    const nameA = a.toLowerCase();
    const nameB = b.toLowerCase();
    return nameA.localeCompare(nameB, 'en');
}

function sortImport(a: Import, b: Import): number {
    const nameA = `${a.path}${a.name}`.toLowerCase();
    const nameB = `${b.path}${b.name}`.toLowerCase();
    return nameA.localeCompare(nameB, 'en');
}

export function sort(a: string | Import, b: string | Import): number {
    if (a instanceof Object && 'name' in a && 'alias' in a && 'path' in a) {
        return sortImport(a as Import, b as Import);
    } else {
        return sortString(a as string, b as string);
    }
}
