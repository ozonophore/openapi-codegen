/* eslint-disable @typescript-eslint/no-explicit-any */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const mergeObjects = (base: Record<string, unknown>, next: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(next)) {
        const existing = result[key];
        if (isPlainObject(existing) && isPlainObject(value)) {
            result[key] = mergeObjects(existing, value);
        } else {
            result[key] = value;
        }
    }
    return result;
};

const expandAllOf = (value: Record<string, unknown>): Record<string, unknown> => {
    const allOf = Array.isArray(value.allOf) ? value.allOf : null;
    if (!allOf) return value;

    let merged: Record<string, unknown> = {};
    for (const item of allOf) {
        if (isPlainObject(item)) {
            merged = mergeObjects(merged, item);
        }
    }

    const rest: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
        if (key === 'allOf') continue;
        rest[key] = val;
    }

    return mergeObjects(merged, rest);
};

export const normalizeObject = (value: any): any => {
    if (value === null || value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(item => normalizeObject(item));
    }

    if (typeof value !== 'object') {
        return value;
    }

    const expanded = expandAllOf(value as Record<string, unknown>);
    const entries = Object.entries(expanded).sort(([a], [b]) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });

    const result: Record<string, unknown> = {};

    for (const [key, val] of entries) {
        result[key] = normalizeObject(val);
    }

    return result;
};
