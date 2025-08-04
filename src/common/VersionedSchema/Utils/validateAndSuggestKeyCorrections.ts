import leven from "leven";

/**
 * Optimized unknown key verification function using Levenshtein distance map.
 * 
 * @param rawInputKeys Array of raw input keys
 * @param allowedKeys Set of allowed (required) keys
 */
export function validateAndSuggestKeyCorrections(rawInputKeys: string[], allowedKeys: Set<string>) {
    const errors: string[] = [];
    const distanceMap = new Map<string, { bestMatch: string | null; bestDistance: number }>();

    // Creating a distance map once for all keys
    for (const key of rawInputKeys) {
        if (!allowedKeys.has(key)) {
            let bestMatch: string | null = null;
            let bestDistance = Infinity;
            for (const candidate of allowedKeys) {
                const d = leven(key, candidate);
                if (d < bestDistance) {
                    bestDistance = d;
                    bestMatch = candidate;
                }
            }
            distanceMap.set(key, { bestMatch, bestDistance });
        }
    }


    // Generating error messages
    for (const [key, { bestMatch, bestDistance }] of distanceMap) {
        if (bestMatch && bestDistance <= 3) {
            errors.push(`The "${key}" field is not recognized. Perhaps you meant "${bestMatch}".`);
        } else {
            errors.push(`The "${key}" field is not recognized.`);
        }
    }

    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}