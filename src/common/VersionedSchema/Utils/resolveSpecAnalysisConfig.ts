import type { ImplementedAnomalyCategory } from '../anomalyDetectorCategories';
import { normalizeMarauderBoolean } from './createBooleanToObjectSchema';
import { mergeMarauderBlockDeep } from './mergeMarauderBlock';

export type SpecAnalysisConfigInput = {
    enabled?: boolean;
    severity?: 'low' | 'medium' | 'high';
    reportFormat?: 'json' | 'markdown' | 'html';
    reportPath?: string;
    failOnHigh?: boolean;
    failOnAnomalies?: boolean;
    crossSpec?: boolean;
    maxNestingDepth?: number;
    includeCategories?: ImplementedAnomalyCategory[];
    excludeCategories?: ImplementedAnomalyCategory[];
};

/**
 * Resolves effective spec analysis config from canonical `specAnalysis` and deprecated `anomalyDetection` alias.
 */
export function resolveSpecAnalysisConfig(
    specAnalysis: SpecAnalysisConfigInput | boolean | undefined,
    anomalyDetection: SpecAnalysisConfigInput | boolean | undefined
): SpecAnalysisConfigInput | undefined {
    const normalizedSpec = normalizeMarauderBoolean(specAnalysis);
    const normalizedLegacy = normalizeMarauderBoolean(anomalyDetection);

    if (normalizedSpec === undefined && normalizedLegacy === undefined) {
        return undefined;
    }

    const merged = mergeMarauderBlockDeep(normalizedLegacy, normalizedSpec) as SpecAnalysisConfigInput | undefined;
    if (!merged) {
        return undefined;
    }

    const failOnHigh = merged.failOnHigh ?? merged.failOnAnomalies;
    const result: SpecAnalysisConfigInput = { ...merged };
    delete result.failOnAnomalies;
    if (failOnHigh !== undefined) {
        result.failOnHigh = failOnHigh;
    } else {
        delete result.failOnHigh;
    }
    return result;
}
