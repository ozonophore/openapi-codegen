/**
 * AI-Powered Recommendation Engine
 * Provides intelligent suggestions for swarm optimization and improvements
 */

import { Feedback, FeedbackLoop, Recommendation, RecommendationContext, RecommendationReport, RoadmapPhase } from './types';

export class RecommendationEngine {
    private feedbackHistory: Feedback[] = [];
    private learningCurve: number = 0.5;
    private readonly DEFAULT_CONFIG = {
        enableFeedback: true,
        minConfidenceScore: 0.6,
        maxRecommendations: 20,
    };

    /**
     * Generate AI-powered recommendations for swarm
     */
    public generateRecommendations(context: RecommendationContext): RecommendationReport {
        const recommendations: Recommendation[] = [];

        // Analyze performance
        const perfRecommendations = this.analyzePerformance(context);
        recommendations.push(...perfRecommendations);

        // Analyze reliability
        const reliabilityRecommendations = this.analyzeReliability(context);
        recommendations.push(...reliabilityRecommendations);

        // Analyze maintenance
        const maintenanceRecommendations = this.analyzeMaintenance(context);
        recommendations.push(...maintenanceRecommendations);

        // Analyze scalability
        const scalabilityRecommendations = this.analyzeScalability(context);
        recommendations.push(...scalabilityRecommendations);

        // Analyze security
        const securityRecommendations = this.analyzeSecurity(context);
        recommendations.push(...securityRecommendations);

        // Filter by confidence and limit
        const filtered = recommendations
            .filter(r => r.confidenceScore >= this.DEFAULT_CONFIG.minConfidenceScore)
            .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return (priorityOrder[a.priority as keyof typeof priorityOrder] || 99) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 99);
            })
            .slice(0, this.DEFAULT_CONFIG.maxRecommendations);

        // Generate summary
        const summary = this.generateSummary(filtered);

        // Create feedback loop
        const feedbackLoop: FeedbackLoop = {
            enabled: this.DEFAULT_CONFIG.enableFeedback,
            collectedFeedback: this.feedbackHistory,
            learningCurve: this.learningCurve,
            adaptedRecommendations: this.adaptRecommendationsBasedOnFeedback(filtered),
        };

        return {
            timestamp: new Date().toISOString(),
            totalRecommendations: filtered.length,
            criticalRecommendations: filtered.filter(r => r.priority === 'critical').length,
            recommendations: filtered,
            summary,
            feedbackLoop,
        };
    }

    /**
     * Analyze performance metrics and generate recommendations
     */
    private analyzePerformance(context: RecommendationContext): Recommendation[] {
        const recommendations: Recommendation[] = [];
        const metrics = context.performanceMetrics;

        // High latency detection
        if (metrics.averageLatency && metrics.averageLatency > 200) {
            recommendations.push({
                id: 'perf-high-latency',
                title: 'Reduce Average Latency',
                description: `Current average latency is ${metrics.averageLatency}ms. Consider implementing request caching, connection pooling, or optimizing backend services.`,
                category: 'performance',
                priority: 'high',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    performanceGain: '20-40% latency reduction',
                },
                implementationEffort: 'medium',
                autoImplementable: true,
                confidenceScore: 0.85,
                rationale: 'High latency directly impacts user experience and throughput',
                implementationPath: 'smart-caching',
                alternativeApproaches: [
                    {
                        name: 'Connection Pooling',
                        description: 'Reuse HTTP connections across requests',
                        pros: ['Immediate improvement', 'Low implementation effort'],
                        cons: ['Limited gains if latency is server-side'],
                        effort: 'low',
                    },
                    {
                        name: 'Request Batching',
                        description: 'Combine multiple requests into single batch call',
                        pros: ['Significant gains for read operations', 'Reduces round trips'],
                        cons: ['Requires API support', 'May increase complexity'],
                        effort: 'medium',
                    },
                ],
            });
        }

        // Low throughput detection
        if (metrics.throughput && metrics.throughput < 5000) {
            recommendations.push({
                id: 'perf-low-throughput',
                title: 'Increase Throughput',
                description: `Current throughput is ${metrics.throughput} req/s. Consider implementing request batching or parallel request execution.`,
                category: 'performance',
                priority: 'high',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    performanceGain: '5-10x throughput improvement',
                },
                implementationEffort: 'medium',
                autoImplementable: true,
                confidenceScore: 0.8,
                rationale: 'Higher throughput enables handling more concurrent requests efficiently',
            });
        }

        // Poor cache hit rate
        if (metrics.cacheHitRate && metrics.cacheHitRate < 0.6) {
            recommendations.push({
                id: 'perf-cache-strategy',
                title: 'Improve Cache Strategy',
                description: `Cache hit rate is only ${(metrics.cacheHitRate * 100).toFixed(1)}%. Optimize caching strategy and TTL settings.`,
                category: 'performance',
                priority: 'medium',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    performanceGain: '2-3x speed improvement for cached requests',
                },
                implementationEffort: 'low',
                autoImplementable: true,
                confidenceScore: 0.75,
                rationale: 'Better cache utilization reduces unnecessary API calls',
            });
        }

        return recommendations;
    }

    /**
     * Analyze reliability and generate recommendations
     */
    private analyzeReliability(context: RecommendationContext): Recommendation[] {
        const recommendations: Recommendation[] = [];
        const metrics = context.performanceMetrics;

        // High error rate
        if (metrics.errorRate && metrics.errorRate > 0.01) {
            recommendations.push({
                id: 'reliability-high-errors',
                title: 'Implement Fault Tolerance',
                description: `Current error rate is ${(metrics.errorRate * 100).toFixed(2)}%. Implement circuit breakers and retry strategies.`,
                category: 'reliability',
                priority: 'critical',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    riskReduction: '80% reduction in cascading failures',
                },
                implementationEffort: 'medium',
                autoImplementable: true,
                confidenceScore: 0.9,
                rationale: 'High error rates indicate system instability',
            });
        }

        // Detect batch endpoints
        const hasBatchEndpoints = context.anomalies?.some(a => a.type === 'batch-endpoints-available');
        if (hasBatchEndpoints) {
            recommendations.push({
                id: 'reliability-batch-endpoints',
                title: 'Leverage Batch Endpoints',
                description: 'Your API supports batch endpoints. Enable automatic batching to reduce individual request failures.',
                category: 'reliability',
                priority: 'high',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    performanceGain: '10-50x throughput improvement',
                    riskReduction: 'Fewer individual failures',
                },
                implementationEffort: 'low',
                autoImplementable: true,
                confidenceScore: 0.95,
                rationale: 'Batch operations are more reliable and efficient',
            });
        }

        return recommendations;
    }

    /**
     * Analyze maintenance burden and generate recommendations
     */
    private analyzeMaintenance(context: RecommendationContext): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Check for service count
        if (context.avatars.length > 10) {
            recommendations.push({
                id: 'maintenance-swarm-complexity',
                title: 'Simplify Swarm Architecture',
                description: `You manage ${context.avatars.length} services. Consider grouping related services into logical domains.`,
                category: 'maintenance',
                priority: 'medium',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    maintenanceImprovement: '30-50% reduction in operational overhead',
                },
                implementationEffort: 'high',
                autoImplementable: false,
                confidenceScore: 0.7,
                rationale: 'Too many independent services increase complexity',
            });
        }

        // Check for type consistency
        const consistencyIssues = context.swarm.healthStatus.issues.filter(i => i.component === 'type-system');
        if (consistencyIssues.length > 0) {
            recommendations.push({
                id: 'maintenance-type-consistency',
                title: 'Establish Type Contracts',
                description: `Found ${consistencyIssues.length} type inconsistency issues. Create strict type contracts across services.`,
                category: 'maintenance',
                priority: 'high',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    maintenanceImprovement: 'Easier refactoring and evolution',
                },
                implementationEffort: 'medium',
                autoImplementable: false,
                confidenceScore: 0.85,
                rationale: 'Consistent types reduce integration bugs',
            });
        }

        return recommendations;
    }

    /**
     * Analyze scalability and generate recommendations
     */
    private analyzeScalability(context: RecommendationContext): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Check total bundle size
        let totalBundleSize = 0;
        for (const avatar of context.avatars) {
            totalBundleSize += avatar.metadata.performanceProfile?.estimatedBundleSize || 0;
        }

        if (totalBundleSize > 50 * 1024 * 1024) {
            // > 50MB
            recommendations.push({
                id: 'scalability-large-bundle',
                title: 'Optimize Bundle Size',
                description: `Total bundle size is ${(totalBundleSize / 1024 / 1024).toFixed(1)}MB. Consider code splitting or lazy loading.`,
                category: 'scalability',
                priority: 'high',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    performanceGain: '30-60% faster initial load',
                },
                implementationEffort: 'high',
                autoImplementable: false,
                confidenceScore: 0.8,
                rationale: 'Large bundles impact initial load time and memory usage',
            });
        }

        // Check for potential horizontal scaling
        if (context.avatars.length > 5) {
            recommendations.push({
                id: 'scalability-horizontal-scaling',
                title: 'Enable Horizontal Scaling',
                description: 'With multiple independent services, implement load balancing and service mesh patterns.',
                category: 'scalability',
                priority: 'medium',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    performanceGain: 'Linear throughput scaling with added instances',
                },
                implementationEffort: 'high',
                autoImplementable: false,
                confidenceScore: 0.7,
                rationale: 'Distributed architecture benefits from horizontal scaling',
            });
        }

        return recommendations;
    }

    /**
     * Analyze security concerns and generate recommendations
     */
    private analyzeSecurity(context: RecommendationContext): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Check for rate limiting
        const hasRateLimiting = context.anomalies?.some(a => a.type === 'rate-limit-patterns');
        if (hasRateLimiting) {
            recommendations.push({
                id: 'security-rate-limiting',
                title: 'Implement Rate Limit Handling',
                description: 'Your API implements rate limiting. Add automatic backoff and circuit breakers.',
                category: 'security',
                priority: 'high',
                affectedAvatars: context.avatars.map(a => a.id),
                estimatedImpact: {
                    riskReduction: 'Prevent rate limit bans and service disruptions',
                },
                implementationEffort: 'low',
                autoImplementable: true,
                confidenceScore: 0.9,
                rationale: 'Proper rate limit handling prevents service degradation',
            });
        }

        return recommendations;
    }

    /**
     * Generate implementation roadmap
     */
    private generateImplementationRoadmap(recommendations: Recommendation[]): RoadmapPhase[] {
        const roadmap: RoadmapPhase[] = [];
        const critical = recommendations.filter(r => r.priority === 'critical');
        const high = recommendations.filter(r => r.priority === 'high');
        const medium = recommendations.filter(r => r.priority === 'medium');

        if (critical.length > 0) {
            roadmap.push({
                phase: 1,
                name: 'Critical Fixes',
                duration: '1-2 weeks',
                recommendations: critical.map(r => r.id),
                expectedOutcomes: ['System stability improved', 'Error rates reduced'],
                successCriteria: ['All critical issues resolved', 'Error rate < 0.1%'],
            });
        }

        if (high.length > 0) {
            roadmap.push({
                phase: roadmap.length + 1,
                name: 'High Priority Improvements',
                duration: '2-4 weeks',
                recommendations: high.map(r => r.id),
                expectedOutcomes: ['Performance improvements', 'Better reliability'],
                successCriteria: ['Latency reduced by 20%+', 'Throughput improved by 3x+'],
            });
        }

        if (medium.length > 0) {
            roadmap.push({
                phase: roadmap.length + 1,
                name: 'Medium Priority Optimizations',
                duration: '1-2 months',
                recommendations: medium.map(r => r.id),
                expectedOutcomes: ['Enhanced scalability', 'Improved maintainability'],
                successCriteria: ['System handles 2x more load', 'Reduced operational overhead'],
            });
        }

        return roadmap;
    }

    /**
     * Generate summary of recommendations
     */
    private generateSummary(recommendations: Recommendation[]): any {
        const critical = recommendations.filter(r => r.priority === 'critical');
        const high = recommendations.filter(r => r.priority === 'high');

        let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
        if (critical.length > 0) {
            overallHealth = 'poor';
        } else if (high.length > 3) {
            overallHealth = 'fair';
        } else if (recommendations.length === 0) {
            overallHealth = 'excellent';
        }

        return {
            overallSystemHealth: overallHealth,
            topPriorities: critical.length > 0 ? critical.slice(0, 3) : high.slice(0, 3),
            estimatedCumulativeBenefit: this.estimateCumulativeBenefit(recommendations),
            implementationRoadmap: this.generateImplementationRoadmap(recommendations),
        };
    }

    /**
     * Estimate cumulative benefit of all recommendations
     */
    private estimateCumulativeBenefit(recommendations: Recommendation[]): string {
        const performanceGains: number[] = [];
        const riskReductions: string[] = [];

        for (const rec of recommendations) {
            if (rec.estimatedImpact.performanceGain) {
                const match = rec.estimatedImpact.performanceGain.match(/(\d+)/);
                if (match) {
                    performanceGains.push(parseInt(match[1], 10));
                }
            }
            if (rec.estimatedImpact.riskReduction) {
                riskReductions.push(rec.estimatedImpact.riskReduction);
            }
        }

        const maxGain = performanceGains.length > 0 ? Math.max(...performanceGains) : 0;
        return maxGain > 0 ? `Up to ${maxGain}x improvement in peak scenarios` : 'Incremental improvements across system';
    }

    /**
     * Adapt recommendations based on feedback history
     */
    private adaptRecommendationsBasedOnFeedback(recommendations: Recommendation[]): Recommendation[] {
        // Increase confidence for recommendations that had positive feedback
        for (const rec of recommendations) {
            const positiveFeedback = this.feedbackHistory.filter(f => f.recommendationId === rec.id && f.result === 'positive');
            const negativeFeedback = this.feedbackHistory.filter(f => f.recommendationId === rec.id && f.result === 'negative');

            if (positiveFeedback.length > negativeFeedback.length) {
                rec.confidenceScore = Math.min(1, rec.confidenceScore + 0.1);
            } else if (negativeFeedback.length > positiveFeedback.length) {
                rec.confidenceScore = Math.max(0, rec.confidenceScore - 0.15);
            }
        }

        return recommendations;
    }

    /**
     * Record feedback on a recommendation
     */
    public recordFeedback(recommendationId: string, implemented: boolean, result: 'positive' | 'neutral' | 'negative', impact?: string): void {
        const feedback: Feedback = {
            id: `feedback-${Date.now()}`,
            recommendationId,
            implemented,
            result,
            impact,
            timestamp: new Date().toISOString(),
        };

        this.feedbackHistory.push(feedback);

        // Update learning curve
        if (result === 'positive') {
            this.learningCurve = Math.min(1, this.learningCurve + 0.05);
        } else if (result === 'negative') {
            this.learningCurve = Math.max(0, this.learningCurve - 0.05);
        }
    }

    /**
     * Get feedback history
     */
    public getFeedbackHistory(): Feedback[] {
        return [...this.feedbackHistory];
    }

    /**
     * Get learning metrics
     */
    public getLearningMetrics(): any {
        return {
            totalFeedbackReceived: this.feedbackHistory.length,
            positiveFeedback: this.feedbackHistory.filter(f => f.result === 'positive').length,
            negativeFeedback: this.feedbackHistory.filter(f => f.result === 'negative').length,
            neutralFeedback: this.feedbackHistory.filter(f => f.result === 'neutral').length,
            learningCurve: this.learningCurve,
            accuracy: this.calculateAccuracy(),
        };
    }

    /**
     * Calculate recommendation accuracy based on feedback
     */
    private calculateAccuracy(): number {
        if (this.feedbackHistory.length === 0) {
            return 0.5;
        }

        const positive = this.feedbackHistory.filter(f => f.result === 'positive').length;
        return positive / this.feedbackHistory.length;
    }
}
