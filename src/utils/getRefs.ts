export function getRefs(object: any): string[] {
    let result: string[] = [];

    for (const key of Object.keys(object)) {
        if (key === '$ref') {
            if (result.indexOf(object[key]) === -1 && object[key].startsWith('#')) {
                result.push(object[key]);
            }
        } else if (object[key] instanceof Object) {
            const refs = getRefs(object[key]);
            result = [...new Set([...result, ...refs])];
        }
    }
    return result;
}
