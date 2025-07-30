import leven from "leven";

// Generating a key replacement card
export function generateKeyMappingForInvalidKeys(rawInputKeys: string[], allowedKeys: Set<string>): Map<string, string> {
    const result = new Map<string, string>();
    for (const key of rawInputKeys) {
        if (!allowedKeys.has(key)) {
            let bestMatch: string | null = null;
            let bestDistance = Infinity;
            for (const candidate of allowedKeys) {
                const d = leven(key, candidate);
                if (d < bestDistance && d <= 3) {
                    bestDistance = d;
                    bestMatch = candidate;
                }
            }
            if (bestMatch) result.set(key, bestMatch);
        }
    }
    return result;
}