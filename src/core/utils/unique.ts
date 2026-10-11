import equal from 'fast-deep-equal';

export function unique<T>(val: T, index: number, arr: T[]): boolean {
    if (val !== null && typeof val === 'object') {
        return deepUnique(val, index, arr);
    }
    return arr.indexOf(val) === index;
}

export function uniqueByKey<T>(items: T[], keyOf: (item: T) => string): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of items) {
        const key = keyOf(item);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        out.push(item);
    }
    return out;
}

function deepUnique<T>(val: T, index: number, arr: T[]): boolean {
    for (let i = 0; i < arr.length; ++i) {
        if (equal(val, arr[i])) {
            return index === i;
        }
    }
    return false;
}
