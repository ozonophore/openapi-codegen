/**
 * Deep-omit `undefined` values from plain objects (and object elements inside arrays).
 */
export function omitUndefinedValues(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
            continue;
        }

        if (Array.isArray(value)) {
            result[key] = value.map(item => (item && typeof item === 'object' && !Array.isArray(item) ? omitUndefinedValues(item as Record<string, unknown>) : item));
            continue;
        }

        if (value && typeof value === 'object') {
            result[key] = omitUndefinedValues(value as Record<string, unknown>);
            continue;
        }

        result[key] = value;
    }

    return result;
}
