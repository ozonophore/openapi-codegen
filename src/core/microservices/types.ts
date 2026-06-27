/**
 * Avatar Swarm Configuration and Types
 * Defines all interfaces for multi-service coordination and AI-powered recommendations
 */

import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';

export interface AvatarConfig {
    name: string;
    specPath: string;
    spec: CommonOpenApi;
    outputPath: string;
    autonomyLevel: 'low' | 'medium' | 'high';
    roles?: string[];
    dependencies?: string[];
}

export interface Avatar {
    id: string;
    name: string;
    specVersion: string;
    clientPath: string;
    typesPath: string;
    config: AvatarConfig;
    autonomyLevel: 'low' | 'medium' | 'high';
    capabilities: AvatarCapability[];
    metadata: AvatarMetadata;
}

export interface AvatarCapability {
    name: string;
    description: string;
    operations: string[];
    requiredTypes: string[];
    exportedTypes: string[];
}

export interface AvatarMetadata {
    createdAt: string;
    lastUpdated: string;
    generation: number;
    checksumSpec: string;
    checksumCode: string;
    performanceProfile?: PerformanceProfile;
}

export interface PerformanceProfile {
    estimatedBundleSize: number;
    estimatedLatency: number;
    throughputCapacity: number;
    memoryFootprint: number;
    cachedRequests: number;
}

export interface CoordinationRule {
    id: string;
    name: string;
    description: string;
    sourceAvatar: string;
    targetAvatars: string[];
    ruleType: 'consensus' | 'voting' | 'sequential' | 'parallel';
    condition?: (context: CoordinationContext) => boolean;
    action: (context: CoordinationContext) => Promise<any>;
    priority: number;
    enabled: boolean;
}

export interface CoordinationContext {
    timestamp: string;
    sourceAvatarId: string;
    targetAvatarIds: string[];
    operation: string;
    params: Record<string, any>;
    previousResults?: Map<string, any>;
    avatars: Map<string, Avatar>;
}

export interface ConsensusDecision {
    id: string;
    operation: string;
    proposedBy: string;
    votes: Map<string, 'approve' | 'reject' | 'abstain'>;
    consensus: boolean;
    result: any;
    timestamp: string;
}

export interface AvatarSwarm {
    id: string;
    name: string;
    avatars: Avatar[];
    coordinator: Coordinator;
    rules: CoordinationRule[];
    metadata: SwarmMetadata;
    healthStatus: HealthStatus;
}

export interface SwarmMetadata {
    createdAt: string;
    lastUpdated: string;
    totalAvatars: number;
    totalEndpoints: number;
    totalModels: number;
    estimatedTotalBundleSize: number;
    consensusThreshold: number;
    timeoutMs: number;
}

export interface Coordinator {
    id: string;
    strategy: 'consensus' | 'voting' | 'hierarchical';
    rules: CoordinationRule[];
    decisions: ConsensusDecision[];
    messageQueue: QueuedMessage[];
    routingTable: Map<string, string[]>;
}

export interface QueuedMessage {
    id: string;
    from: string;
    to: string[];
    operation: string;
    payload: any;
    timestamp: string;
    retryCount: number;
    maxRetries: number;
}

export interface HealthStatus {
    overallHealth: 'healthy' | 'degraded' | 'critical';
    avatarHealth: Map<string, 'healthy' | 'degraded' | 'critical'>;
    lastCheck: string;
    issues: HealthIssue[];
}

export interface HealthIssue {
    id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    component: string;
    description: string;
    timestamp: string;
    resolved: boolean;
    resolution?: string;
}

export interface RecommendationContext {
    avatars: Avatar[];
    swarm: AvatarSwarm;
    anomalies: any[];
    performanceMetrics: Record<string, any>;
    userFeedback?: Record<string, any>;
}

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    category: 'performance' | 'reliability' | 'maintenance' | 'scalability' | 'security';
    priority: 'low' | 'medium' | 'high' | 'critical';
    affectedAvatars: string[];
    estimatedImpact: {
        performanceGain?: string;
        costReduction?: string;
        riskReduction?: string;
        maintenanceImprovement?: string;
    };
    implementationEffort: 'minimal' | 'low' | 'medium' | 'high' | 'very-high';
    implementationPath?: string;
    autoImplementable: boolean;
    confidenceScore: number;
    rationale: string;
    alternativeApproaches?: AlternativeApproach[];
}

export interface AlternativeApproach {
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    effort: string;
}

export interface RecommendationReport {
    timestamp: string;
    totalRecommendations: number;
    criticalRecommendations: number;
    recommendations: Recommendation[];
    summary: RecommendationSummary;
    feedbackLoop?: FeedbackLoop;
}

export interface RecommendationSummary {
    overallSystemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    topPriorities: Recommendation[];
    estimatedCumulativeBenefit: string;
    implementationRoadmap: RoadmapPhase[];
}

export interface RoadmapPhase {
    phase: number;
    name: string;
    duration: string;
    recommendations: string[];
    expectedOutcomes: string[];
    successCriteria: string[];
}

export interface FeedbackLoop {
    enabled: boolean;
    collectedFeedback: Feedback[];
    learningCurve: number;
    adaptedRecommendations: Recommendation[];
}

export interface Feedback {
    id: string;
    recommendationId: string;
    implemented: boolean;
    result: 'positive' | 'neutral' | 'negative';
    impact?: string;
    timestamp: string;
    notes?: string;
}

export interface UnifiedReport {
    id: string;
    timestamp: string;
    title: string;
    type: 'swarm' | 'migration' | 'health' | 'optimization' | 'comprehensive';
    format: 'json' | 'markdown' | 'html';
    sections: ReportSection[];
    metadata: ReportMetadata;
    markdownContent?: string;
    htmlDashboard?: string;
    jsonApi?: any;
}

export interface ReportSection {
    id: string;
    title: string;
    type: 'summary' | 'details' | 'recommendations' | 'timeline' | 'metrics';
    content: string | any;
    priority: number;
}

export interface ReportMetadata {
    author: string;
    version: string;
    environment: string;
    generationDuration: number;
    dataPoints: number;
}

export interface SwarmGenerationConfig {
    specs: AvatarConfig[];
    outputDir: string;
    coordinationStrategy: 'consensus' | 'voting' | 'hierarchical';
    consensusThreshold: number;
    enableHealthMonitoring: boolean;
    enablePerformanceProfiling: boolean;
    enableAutoOptimization: boolean;
    aiRecommendations: boolean;
    reportFormat: 'json' | 'markdown' | 'html' | 'all';
    generateApiServer?: boolean;
}

export interface SwarmValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    recommendations: string[];
}

export interface ValidationError {
    code: string;
    message: string;
    avatar?: string;
    details: any;
}

export interface ValidationWarning {
    code: string;
    message: string;
    avatar?: string;
    suggestedFix?: string;
}

export interface ServiceConsistencyCheck {
    consistent: boolean;
    inconsistencies: TypeInconsistency[];
    conflicts: ServiceConflict[];
    suggestions: string[];
}

export interface TypeInconsistency {
    typeName: string;
    definition1: string;
    definition2: string;
    avatars: string[];
    severity: 'low' | 'medium' | 'high';
}

export interface ServiceConflict {
    endpoint: string;
    avatars: string[];
    conflictType: 'schema' | 'behavior' | 'performance';
    description: string;
    resolution?: string;
}

export interface CrossAvatarDataFlow {
    from: string;
    to: string;
    operations: string[];
    dataTypes: string[];
    frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
    criticalPath: boolean;
}

export interface SwarmAnalysisResult {
    timestamp: string;
    totalAvatars: number;
    consistencyCheck: ServiceConsistencyCheck;
    dataFlows: CrossAvatarDataFlow[];
    performanceMetrics: SwarmPerformanceMetrics;
    recommendations: Recommendation[];
}

export interface SwarmPerformanceMetrics {
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
    consensusOverhead: number;
}
