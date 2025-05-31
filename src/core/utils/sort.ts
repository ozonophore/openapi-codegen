import { Import } from '../client/interfaces/Import';

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

export function sort(a: any, b: any): number {
    if (a instanceof Object && 'name' in a && 'alias' in a && 'path' in a) {
        return sortImport(a, b);
    } else {
        return sortString(a, b);
    }
}
