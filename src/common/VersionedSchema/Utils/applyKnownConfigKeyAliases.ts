/** CLI-only config key aliases mapped to canonical schema names. */
const CONFIG_KEY_ALIASES: Record<string, string> = {
    exploitAnomalies: 'anomalyExploitation',
};

/**
 * Renames known CLI alias keys to canonical config schema keys before validation.
 */
export function applyKnownConfigKeyAliases(data: Record<string, any>): Record<string, any> {
    const result = { ...data };

    for (const [alias, canonical] of Object.entries(CONFIG_KEY_ALIASES)) {
        if (alias in result && !(canonical in result)) {
            result[canonical] = result[alias];
            delete result[alias];
        }
    }

    return result;
}
