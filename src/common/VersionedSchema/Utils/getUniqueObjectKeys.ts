function collectUniqueObjectKeys<T>(root: Record<string, any>, result: T) {
    const recurse = (v: any) => collectUniqueObjectKeys(v, result);

    if (root && typeof root === 'object') {
        if (Array.isArray(root)) {
            for (const item of root) {
                recurse(item);
            }
        } else {
            for (const key of Object.keys(root)) {
                if (result instanceof Set) {
                    result.add(key);
                }
                recurse(root[key]);
            }
        }
    }
}

/**
 * Get unique keys from object properties (set of options)
 * @param rawInput object properties (set of options)
 * @returns Unique keys from object properties (set of options)
 */
export function getUniqueObjectKeys(rawInput: Record<string, any>) {
    const result = new Set<string>();
    collectUniqueObjectKeys(rawInput, result);

    return Array.from(result);
}
