import { DEFAULT_EXCLUDED_ANOMALY_CATEGORIES } from '../../common/VersionedSchema/anomalyDetectorCategories';
import type { SpecAnalysisConfig } from '../analysis/types';
import type { PrefixArtifacts } from '../types/base/PrefixArtifacts.model';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { forEachOperationInSpec } from '../utils/openApiOperationWalker';
import { detectAmbiguousModelName } from './detectors/ambiguousModelName';
import { detectCircularSchemaRefs } from './detectors/circularSchemaRefs';
import { detectDeeplyNestedSchema } from './detectors/deeplyNestedSchema';
import { detectDeprecatedInActivePaths } from './detectors/deprecatedInActivePaths';
import { detectEmptyOrUntypedSchema } from './detectors/emptyOrUntypedSchema';
import { detectInconsistentResponseTypes } from './detectors/inconsistentResponseTypes';
import { detectMissingOperationId } from './detectors/missingOperationId';
import type { DetectorContext, SpecDetector } from './detectorUtils';
import type { SpecFinding } from './types';

const PER_SPEC_DETECTORS: SpecDetector[] = [
    detectCircularSchemaRefs,
    detectDeeplyNestedSchema,
    detectInconsistentResponseTypes,
    detectAmbiguousModelName,
    detectDeprecatedInActivePaths,
    detectMissingOperationId,
    detectEmptyOrUntypedSchema,
];

export class CodegenSpecAnalyzer {
    private readonly defaultConfig: SpecAnalysisConfig = {
        enabled: true,
        severity: 'medium',
        excludeCategories: [...DEFAULT_EXCLUDED_ANOMALY_CATEGORIES],
    };

    /**
     * Runs all per-spec detectors and returns filtered findings.
     */
    analyze(spec: CommonOpenApi, config?: Partial<SpecAnalysisConfig>, specInput?: string, prefixes?: PrefixArtifacts): SpecFinding[] {
        const mergedConfig = { ...this.defaultConfig, ...config };
        const ctx: DetectorContext = {
            spec,
            config: mergedConfig,
            specInput,
            prefixes,
            walker: {
                forEachOperation: callback => forEachOperationInSpec(spec, callback),
            },
        };

        const findings = PER_SPEC_DETECTORS.flatMap(detector => detector(ctx));
        return this.filterFindings(findings, mergedConfig);
    }

    private filterFindings(findings: SpecFinding[], config: SpecAnalysisConfig): SpecFinding[] {
        const bySeverity = this.filterBySeverity(findings, config.severity ?? 'medium');
        return this.filterByCategories(bySeverity, config);
    }

    /** Filters findings by severity threshold and category include/exclude lists. */
    filter(findings: SpecFinding[], config: SpecAnalysisConfig): SpecFinding[] {
        return this.filterFindings(findings, config);
    }

    private filterBySeverity(findings: SpecFinding[], minSeverity: string): SpecFinding[] {
        const severityMap = { info: 0, low: 1, medium: 2, high: 3 };
        const minLevel = severityMap[minSeverity as keyof typeof severityMap] ?? 2;
        return findings.filter(finding => (severityMap[finding.severity] ?? 0) >= minLevel);
    }

    private filterByCategories(findings: SpecFinding[], config: SpecAnalysisConfig): SpecFinding[] {
        let filtered = findings;

        if (config.includeCategories && config.includeCategories.length > 0) {
            filtered = filtered.filter(finding => config.includeCategories!.includes(finding.category as never));
        }

        if (config.excludeCategories && config.excludeCategories.length > 0) {
            filtered = filtered.filter(finding => !config.excludeCategories!.includes(finding.category as never));
        }

        return filtered;
    }
}

export function runPerSpecAnalysis(spec: CommonOpenApi, config: SpecAnalysisConfig, specInput?: string, prefixes?: PrefixArtifacts): SpecFinding[] {
    const analyzer = new CodegenSpecAnalyzer();
    return analyzer.analyze(spec, config, specInput, prefixes);
}

export function filterSpecFindings(findings: SpecFinding[], config: SpecAnalysisConfig): SpecFinding[] {
    return new CodegenSpecAnalyzer().filter(findings, config);
}
