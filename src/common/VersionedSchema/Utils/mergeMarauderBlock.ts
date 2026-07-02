/**
 * Array keys inside Marauder blocks that use one-level deep merge
 * (see {@link mergeMarauderBlockDeep}).
 */
const MARAUDER_DEEP_MERGE_KEYS = ['excludeCategories', 'detectionRules'] as const;

/**
 * Shallow merge of Marauder config blocks. Override (typically CLI) wins on top-level key collision.
 *
 * **Not recursive:** nested plain objects and most arrays are replaced wholesale when the override
 * sets them. For partial overrides of known array keys (`excludeCategories`, `detectionRules`),
 * use {@link mergeMarauderBlockDeep} at config↔CLI and root↔item boundaries.
 *
 * @example
 * mergeMarauderBlock({ severity: 'high', enabled: true }, { enabled: false })
 * // → { severity: 'high', enabled: false }
 */
export function mergeMarauderBlock(base?: Record<string, unknown>, override?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (override === undefined) {
        return base;
    }

    return { ...(base ?? {}), ...override };
}

/**
 * Shallow merge plus one-level deep handling for known Marauder array keys.
 *
 * Use when merging config with CLI overrides or root Marauder blocks with per-item overrides so
 * partial flags (e.g. `--anomaly-detection.exclude-categories=X`) do not drop sibling fields such
 * as root `severity`.
 *
 * - Most keys: {@link mergeMarauderBlock} shallow spread; override wins on collision.
 * - `excludeCategories`: override replaces the array when set; otherwise base is kept.
 * - `detectionRules`: arrays are concatenated when both sides provide arrays; otherwise override wins.
 */
export function mergeMarauderBlockDeep(base?: Record<string, unknown>, override?: Record<string, unknown>): Record<string, unknown> | undefined {
    const merged = mergeMarauderBlock(base, override);
    if (!merged || !base || !override) {
        return merged;
    }

    for (const key of MARAUDER_DEEP_MERGE_KEYS) {
        const baseValue = base[key];
        const overrideValue = override[key];

        if (overrideValue === undefined) {
            continue;
        }

        if (key === 'detectionRules' && Array.isArray(baseValue) && Array.isArray(overrideValue)) {
            merged[key] = [...baseValue, ...overrideValue];
        } else {
            merged[key] = overrideValue;
        }
    }

    return merged;
}
