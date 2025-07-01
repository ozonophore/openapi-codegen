export function isBoolean(value: any, defaultValue = false) {
    if (value === null || value === undefined) {
        return defaultValue;
    }

    if (value === true || value === false) {
        return value;
    }

    return defaultValue;
}