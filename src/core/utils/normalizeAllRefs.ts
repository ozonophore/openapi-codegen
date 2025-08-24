import type { Context } from '../Context';
import { normalizeRef } from './normalizeRef';

/**
 * Deep traversal and normalization of all $ref in an object
 */
export function normalizeAllRefs<T extends Record<string, any>>(
    obj: T,
    context: Context,
    parentFilePath: string
): T {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }

    // If this object is a $ref holder
    if (obj.$ref && typeof obj.$ref === 'string') {
        const normalizedRef = normalizeRef(obj.$ref, parentFilePath);
        return {
            ...obj,
            $ref: normalizedRef
        } as unknown as T;
    }

    const result: any = Array.isArray(obj) ? [] : { ...obj };

    for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
            // For nested objects, use the same parent file path
            // The normalization will handle the $ref resolution correctly
            result[key] = normalizeAllRefs(value, context, parentFilePath);
        } else if (Array.isArray(value)) {
            result[key] = value.map((item: any) => (item && typeof item === 'object' ? normalizeAllRefs(item, context, parentFilePath) : item));
        } else {
            result[key] = value;
        }
    }

    return result as T;
}