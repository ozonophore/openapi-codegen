import { ANOMALY_CATEGORY_LEGACY_NAMES } from '../../common/VersionedSchema/anomalyDetectorCategories';
import { CodegenSpecAnalyzer } from '../specAnalysis/CodegenSpecAnalyzer';
import type { SpecFinding } from '../specAnalysis/types';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { Anomaly, AnomalyDetectionConfig, AnomalyReport, AnomalySummary, OptimizationRecommendation } from './types';

function mapFindingToAnomaly(finding: SpecFinding): Anomaly {
    const legacyType = ANOMALY_CATEGORY_LEGACY_NAMES[finding.category as keyof typeof ANOMALY_CATEGORY_LEGACY_NAMES] ?? finding.category;

    return {
        id: finding.id,
        type: legacyType as Anomaly['type'],
        severity: finding.severity === 'info' ? 'low' : finding.severity,
        description: finding.description,
        affectedPaths: finding.affectedPaths,
        benefitCategory: 'Code Generation',
        estimatedBenefit: finding.suggestedAction ?? 'Improved generated TypeScript quality',
        suggestedAction: finding.suggestedAction,
    };
}

function buildSummary(anomalies: Anomaly[]): AnomalySummary {
    const highSeverity = anomalies.filter(a => a.severity === 'high');

    return {
        estimatedPerformanceGain: highSeverity.length > 0 ? 'High-severity codegen issues detected' : 'Minor improvements',
        bundleSizeImpact: 'Depends on generated client structure',
        mainThrottlingPoints: [...new Set(anomalies.map(a => a.benefitCategory))],
        opportunitiesCount: anomalies.length,
        implementationEffort: anomalies.length > 10 ? 'high' : anomalies.length > 5 ? 'medium' : 'low',
    };
}

function buildRecommendations(anomalies: Anomaly[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    if (anomalies.some(a => a.type === 'circular-references' || a.type === 'circular-schema-refs')) {
        recommendations.push({
            title: 'Resolve circular schema references',
            description: 'Break $ref cycles to avoid any types and broken imports in generated code',
            implementationPath: 'spec-analysis',
            priority: 'critical',
        });
    }

    if (anomalies.some(a => a.type === 'inconsistent-response-types')) {
        recommendations.push({
            title: 'Standardize responses',
            description: 'Normalize 2xx response schemas across related endpoints',
            implementationPath: 'spec-analysis',
            priority: 'medium',
        });
    }

    return recommendations;
}

export class AnomalyDetector {
    private readonly analyzer = new CodegenSpecAnalyzer();

    /**
     * Detect anomalies in OpenAPI specification and generate report.
     * @deprecated Delegates to CodegenSpecAnalyzer; use runSpecAnalysis directly.
     */
    public detectAndReport(spec: CommonOpenApi, config?: Partial<AnomalyDetectionConfig>): AnomalyReport {
        const findings = this.analyzer.analyze(spec, config);
        const anomalies = findings.map(mapFindingToAnomaly);

        return {
            timestamp: new Date().toISOString(),
            specVersion: (spec as { openapi?: string; swagger?: string }).openapi ?? (spec as { swagger?: string }).swagger ?? 'unknown',
            totalAnomalies: anomalies.length,
            criticalAnomalies: anomalies.filter(a => a.severity === 'high').length,
            anomalies,
            summary: buildSummary(anomalies),
            recommendations: buildRecommendations(anomalies),
        };
    }
}
