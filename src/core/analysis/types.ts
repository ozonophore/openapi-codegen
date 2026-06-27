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
export type AnomalyType = ImplementedAnomalyCategory;

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
    implementationPath: string; // e.g., "use --exploit-anomalies flag"
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedPerformanceGain?: string;
}

/**
 * Configuration for anomaly detection
 */
export interface AnomalyDetectionConfig {
    enabled: boolean;
    severity?: 'high' | 'medium' | 'low'; // Minimum severity to report
    includeCategories?: AnomalyType[]; // If empty, detect all
    excludeCategories?: AnomalyType[];
    reportFormat?: 'json' | 'markdown' | 'html';
    reportPath?: string;
    failOnAnomalies?: boolean;
    maxNestingDepth?: number;
}

/**
 * Endpoint pattern for batch operations
 */
export interface BatchEndpointPattern {
    batchPath: string;
    singlePath: string;
    estimatedThroughputGain: number; // e.g., 10x
}

export interface AnomalyExploitationConfig {
    enabled?: boolean;
    strategy?: 'aggressive' | 'balanced' | 'conservative';
    categories?: ('time-folding' | 'batch-requests' | 'circuit-breaker' | 'smart-caching' | 'connection-pooling' | 'request-deduplication')[];
    /** Directory for generated optimization modules (relative to cwd or absolute) */
    outputPath?: string;
}

export interface OptimizationOpportunity {
    id: string;
    category: 'time-folding' | 'batch-requests' | 'circuit-breaker' | 'smart-caching' | 'connection-pooling' | 'request-deduplication';
    description: string;
    estimatedGain: string;
    complexity: 'low' | 'medium' | 'high';
    requiredChanges: string[];
    template?: string;
    relatedAnomalies: string[];
}

export interface ExploitationResult {
    opportunities: OptimizationOpportunity[];
    selectedCategories: string[];
    generatedCode: {
        [key: string]: string;
    };
    integrationGuide: string;
    estimatedPerformanceGain: string;
}
