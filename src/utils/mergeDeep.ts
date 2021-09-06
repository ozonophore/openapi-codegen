export function mergeDeep(...objects: any[]) {
    const isObject = (obj: any) => obj && typeof obj === 'object';
    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach((key) => {
            const prevVal = prev[key];
            const objVal = obj[key];

            if (Array.isArray(prevVal) && Array.isArray(objVal)) {
                prev[key] = prevVal.concat(...objVal);
            } else if (isObject(prevVal) && isObject(objVal)) {
                prev[key] = mergeDeep(prevVal, objVal);
            } else {
                prev[key] = objVal;
            }
        });

        return prev;
    }, {});
}