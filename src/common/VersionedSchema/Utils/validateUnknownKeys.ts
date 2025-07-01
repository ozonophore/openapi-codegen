import leven from "leven";

export function validateUnknownKeys(rawInputKeys: string[], allowed: Set<string>) {
    const errors: string[] = [];

    for (const key of rawInputKeys) {
        if (!allowed.has(key)) {
            let bestMatch: string | null = null;
            let bestDistance = Infinity;
            for (const candidate of allowed) {
                const d = leven(key, candidate);
                if (d < bestDistance) {
                    bestDistance = d;
                    bestMatch = candidate;
                }
            }
            if (bestMatch && bestDistance <= 3) {
                errors.push(`The "${key}" field is not recognized. Perhaps you meant "${bestMatch}".`);
            } else {
                errors.push(`The "${key}" field is not recognized.`);
            }
        }
    }

    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}