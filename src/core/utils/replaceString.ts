export function replaceString(value?: string): string | null | undefined {
    if (!value) {
        return value;
    }
    const searchRegExp = /\\/g;
    return value.replace(searchRegExp, '/');
}
