export function pathToArray(pointer: string): string[] {
    if (pointer.length <= 1 || pointer[0] !== '#' || pointer[1] !== '/') {
        return [];
    }

    return pointer
        .slice(2)
        .split('/')
        .map(value => {
            return decodeURIComponent(value);
        });
};
