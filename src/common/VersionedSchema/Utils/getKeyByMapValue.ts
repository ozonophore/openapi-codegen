export function getKeyByMapValue(keysMap: Map<string, string>, searchValue: string) {
    for (const [key, value] of keysMap.entries()) {
        if (value === searchValue) {
            return key;
        }
    }

    return undefined;
}