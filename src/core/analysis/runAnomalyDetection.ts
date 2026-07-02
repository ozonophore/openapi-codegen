import { Logger } from '../../common/Logger';
import { runSpecAnalysis } from '../specAnalysis/runSpecAnalysis';
import type { PrefixArtifacts } from '../types/base/PrefixArtifacts.model';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { AnomalyDetectionConfig, AnomalyReport } from './types';

/**
 * Runs spec analysis (legacy name: anomaly detection).
 * @deprecated Prefer runSpecAnalysis from specAnalysis module.
 */
export async function runAnomalyDetection(spec: CommonOpenApi, config: AnomalyDetectionConfig, logger: Logger, specInput?: string, prefixes?: PrefixArtifacts): Promise<AnomalyReport> {
    const report = await runSpecAnalysis(spec, config, logger, specInput, undefined, prefixes);
    const anomalies = report.perSpec.map((finding, index) => ({
        id: finding.id ?? `${finding.category}-${index}`,
        type: finding.category,
        severity: finding.severity === 'info' ? ('low' as const) : finding.severity,
        description: finding.description,
        affectedPaths: finding.affectedPaths,
        benefitCategory: 'spec-quality',
        estimatedBenefit: finding.suggestedAction ?? '',
        suggestedAction: finding.suggestedAction,
    }));

    return {
        timestamp: new Date().toISOString(),
        specVersion: 'unknown',
        totalAnomalies: anomalies.length,
        criticalAnomalies: report.summary.high,
        anomalies,
        summary: {
            estimatedPerformanceGain: 'n/a',
            bundleSizeImpact: 'n/a',
            mainThrottlingPoints: [],
            opportunitiesCount: anomalies.length,
            implementationEffort: 'medium',
        },
        recommendations: [],
    };
}
