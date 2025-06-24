import equal from 'fast-deep-equal';

export function unique<T>(val: T, index: number, arr: T[]): boolean {
    return deepUnique(val, index, arr);
}

function deepUnique<T>(val: T, index: number, arr: T[]): boolean {
    for (let i = 0; i < arr.length; ++i) {
        if (equal(val, arr[i])) {
            return index === i;
        }
    }
    return false;
}
