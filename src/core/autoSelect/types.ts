import { HttpClient } from '../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../types/enums/ValidationLibrary.enum';
import type { DetectionRule } from './detection/types';

/**
 * Project analysis metadata used for intelligent component selection
 */
export interface ProjectAnalysis {
    packageJson: PackageJsonMetadata;
    bundleSize: BundleSizeMetadata;
    performanceRequirements: PerformanceRequirements;
    existingDependencies: DependencyMap;
    deploymentTarget: DeploymentTarget;
}

/**
 * Extracted package.json metadata
 */
export interface PackageJsonMetadata {
    name?: string;
    type?: 'module' | 'commonjs';
    engines?: {
        node?: string;
        npm?: string;
    };
    existingValidators: ValidationLibrary[];
    existingHttpClients: HttpClient[];
}

/**
 * Bundle size estimation
 */
export interface BundleSizeMetadata {
    estimatedMinified: number; // bytes
    hasTreeShaking: boolean;
    hasBundler: boolean;
    bundlerType?: 'webpack' | 'esbuild' | 'rollup' | 'vite' | 'other';
}

/**
 * Performance characteristics detected from project
 */
export interface PerformanceRequirements {
    isMobileTarget: boolean;
    isEdgeFunction: boolean;
    requiresSmallBundle: boolean; // < 100KB target
    requiresHighThroughput: boolean;
    hasBatchEndpoints: boolean;
}

/**
 * Dependency map for conflict detection
 */
export type DependencyMap = {
    [key: string]: string; // package -> version
};

/**
 * Detected deployment target
 */
export type DeploymentTarget = 'browser' | 'nodejs' | 'edge' | 'react-native' | 'unknown';

/**
 * Selection result from AutoSelector
 */
export interface AutoSelectResult {
    validator: ValidationLibrary;
    httpClient: HttpClient;
    explanations: SelectionExplanation[];
    recommendations: Recommendation[];
}

/**
 * Why a specific component was selected
 */
export interface SelectionExplanation {
    component: 'validator' | 'httpClient';
    selected: string;
    reasons: string[];
    alternatives?: Array<{
        option: string;
        why_not: string;
    }>;
}

/**
 * Additional optimization recommendations
 */
export interface Recommendation {
    category: 'performance' | 'compatibility' | 'bundle-size' | 'developer-experience';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    action?: string;
}

/**
 * Configuration for AutoSelector behavior
 */
export interface AutoSelectConfig {
    enabled: boolean;
    strict?: boolean; // If true, only use detected dependencies
    preferSmallBundles?: boolean;
    preferStandards?: boolean;
    /** Additional package.json detection rules (appended after defaults) */
    detectionRules?: DetectionRule[];
    customRules?: AutoSelectRule[];
}

/**
 * Custom rule for auto-selection
 */
export interface AutoSelectRule {
    name: string;
    condition: (analysis: ProjectAnalysis) => boolean;
    validator?: ValidationLibrary;
    httpClient?: HttpClient;
    priority?: number; // Higher priority wins
}
