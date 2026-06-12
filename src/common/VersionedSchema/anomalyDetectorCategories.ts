/**
 * Spec analysis categories implemented in CodegenSpecAnalyzer and CrossSpecAnalyzer.
 */
const PER_SPEC_ANALYSIS_CATEGORIES = [
    'circular-schema-refs',
    'deeply-nested-schema',
    'inconsistent-response-types',
    'ambiguous-model-name',
    'deprecated-in-active-paths',
    'missing-operation-id',
    'empty-or-untyped-schema',
] as const;

const CROSS_SPEC_ANALYSIS_CATEGORIES = ['cross-spec-name-hash-conflict', 'cross-spec-reuse-opportunity', 'cross-spec-drift', 'shared-output-collision-risk'] as const;

export const IMPLEMENTED_ANOMALY_CATEGORIES = [...PER_SPEC_ANALYSIS_CATEGORIES, ...CROSS_SPEC_ANALYSIS_CATEGORIES] as const;

export type ImplementedAnomalyCategory = (typeof IMPLEMENTED_ANOMALY_CATEGORIES)[number];

/** @deprecated Reverse map for AnomalyDetector test backward compat. */
export const ANOMALY_CATEGORY_LEGACY_NAMES: Partial<Record<ImplementedAnomalyCategory, string>> = {
    'circular-schema-refs': 'circular-references',
    'deeply-nested-schema': 'deeply-nested-objects',
    'deprecated-in-active-paths': 'deprecated-endpoints',
    'empty-or-untyped-schema': 'schema-inconsistencies',
    'ambiguous-model-name': 'schema-inconsistencies',
};

/** Default exclude list (removed noisy runtime heuristics from legacy detector). */
export const DEFAULT_EXCLUDED_ANOMALY_CATEGORIES: ImplementedAnomalyCategory[] = [];
