import type { ImplementedAnomalyCategory } from '../../common/VersionedSchema/anomalyDetectorCategories';

/**
 * Detected anomaly in OpenAPI specification
 */
export interface Anomaly {
    id: string;
    type: AnomalyType;
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedPaths?: string[];
    benefitCategory: string;
    estimatedBenefit: string;
    examples?: string[];
    suggestedAction?: string;
}

/**
 * Types of anomalies detected (implemented detectors only)
 */
export type AnomalyType = ImplementedAnomalyCategory | string;

/**
 * Report containing all detected anomalies
 */
export interface AnomalyReport {
    timestamp: string;
    specVersion: string;
    totalAnomalies: number;
    criticalAnomalies: number;
    anomalies: Anomaly[];
    summary: AnomalySummary;
    recommendations: OptimizationRecommendation[];
}

/**
 * Summary statistics
 */
export interface AnomalySummary {
    estimatedPerformanceGain: string;
    bundleSizeImpact: string;
    mainThrottlingPoints: string[];
    opportunitiesCount: number;
    implementationEffort: 'low' | 'medium' | 'high';
}

/**
 * Recommended optimization based on anomalies
 */
export interface OptimizationRecommendation {
    title: string;
    description: string;
    implementationPath: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedPerformanceGain?: string;
}

/**
 * Configuration for OpenAPI spec analysis.
 */
export interface SpecAnalysisConfig {
    enabled: boolean;
    severity?: 'high' | 'medium' | 'low';
    includeCategories?: ImplementedAnomalyCategory[];
    excludeCategories?: ImplementedAnomalyCategory[];
    reportFormat?: 'json' | 'markdown' | 'html';
    reportPath?: string;
    failOnHigh?: boolean;
    crossSpec?: boolean;
    maxNestingDepth?: number;
}

/**
 * @deprecated Use SpecAnalysisConfig instead.
 */
export interface AnomalyDetectionConfig extends SpecAnalysisConfig {
    failOnAnomalies?: boolean;
}
