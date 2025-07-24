export function isInstanceOfMultioptions(value: Record<string, any> | null) {
    return value && Object.values(value).some(prop => Array.isArray(prop));
}