/**
 * Anomaly categories implemented in AnomalyDetector.
 * Categories listed only in docs/changelog as future work are intentionally omitted from the schema.
 */
export const IMPLEMENTED_ANOMALY_CATEGORIES = [
    'inconsistent-response-types',
    'batch-endpoints-available',
    'redundant-endpoints',
    'missing-pagination',
    'missing-caching-headers',
    'circular-references',
    'deeply-nested-objects',
    'rate-limit-patterns',
    'deprecated-endpoints',
    'schema-inconsistencies',
] as const;

export type ImplementedAnomalyCategory = (typeof IMPLEMENTED_ANOMALY_CATEGORIES)[number];

/** High false-positive heuristics excluded unless user opts in via config. */
export const DEFAULT_EXCLUDED_ANOMALY_CATEGORIES: ImplementedAnomalyCategory[] = ['missing-pagination', 'missing-caching-headers'];
