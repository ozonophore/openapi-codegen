
// Replacing incorrect keys
export function replaceInvalidKeysWithMappedNames(
    input: Record<string, any> | Record<string, any>[],
    keyMap: Map<string, string>
): Record<string, any> | Record<string, any>[] {
    if (!input) {
        throw new Error("The input data cannot be null or undefined.");
    }
    if (Array.isArray(input)) {
        return input.map(item => replaceInvalidKeysWithMappedNames(item, keyMap));
    }

    const replacedKeys = Object.entries(input).map(([key, value]) => {
        const newKey = keyMap.get(key) ?? key;
        const newValue = Array.isArray(value) ? replaceInvalidKeysWithMappedNames(value, keyMap) : value;
        return [newKey, newValue];
    });

    return Object.fromEntries(replacedKeys);
}