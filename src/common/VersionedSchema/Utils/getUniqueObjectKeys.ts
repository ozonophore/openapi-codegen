import { traverseGeneric } from "./traverseGeneric";

/**
 * Get unique keys from object properties (set of options)
 * @param rawInput object properties (set of options)
 * @returns Unique keys from object properties (set of options)
 */
export function getUniqueObjectKeys(rawInput: Record<string, any>) {
    const result = new Set<string>();
    traverseGeneric(rawInput, [], result);

    return Array.from(result);
}