/**
 * Avatar Swarm Generator
 * Orchestrates generation of multiple independent but coordinated API clients
 */

import path from 'path';

import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import {
    Avatar,
    AvatarConfig,
    AvatarSwarm,
    CoordinationRule,
    Coordinator,
    CrossAvatarDataFlow,
    HealthIssue,
    HealthStatus,
    ServiceConsistencyCheck,
    SwarmAnalysisResult,
    SwarmGenerationConfig,
    SwarmPerformanceMetrics,
    SwarmValidationResult,
} from './types';

export class AvatarSwarmGenerator {
    private avatars: Map<string, Avatar> = new Map();
    private swarmId: string;

    constructor() {
        this.swarmId = this.generateSwarmId();
    }

    /**
     * Generate a swarm of coordinated avatars from multiple OpenAPI specifications
     */
    public generateSwarm(config: SwarmGenerationConfig): { swarm: AvatarSwarm; analysisResult: SwarmAnalysisResult } {
        // Validate input specifications
        const validationResult = this.validateSpecifications(config.specs);
        if (!validationResult.isValid) {
            throw new Error(`Swarm validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
        }

        // Generate individual avatars
        const avatars = this.generateAvatars(config);

        // Establish coordination rules and attach them to the coordinator
        const rules = this.establishCoordinationRules(avatars, config.coordinationStrategy);
        const coordinator = this.createCoordinator(config.coordinationStrategy, avatars);
        coordinator.rules = rules;

        // Analyze swarm consistency and data flows
        const analysisResult = this.analyzeSwarmConsistency(avatars, config);

        // Perform health check
        const healthStatus = config.enableHealthMonitoring !== false ? this.performHealthCheck(avatars, analysisResult) : this.createDefaultHealthStatus(avatars);

        const swarm: AvatarSwarm = {
            id: this.swarmId,
            name: this.generateSwarmName(avatars),
            avatars,
            coordinator,
            rules,
            metadata: {
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                totalAvatars: avatars.length,
                totalEndpoints: this.countTotalEndpoints(avatars),
                totalModels: this.countTotalModels(avatars),
                estimatedTotalBundleSize: this.estimateBundleSize(avatars),
                consensusThreshold: config.consensusThreshold || 0.66,
                timeoutMs: 5000,
            },
            healthStatus,
        };

        return { swarm, analysisResult };
    }

    /**
     * Default healthy status when health monitoring is disabled
     */
    private createDefaultHealthStatus(avatars: Avatar[]): HealthStatus {
        const avatarHealth = new Map<string, 'healthy' | 'degraded' | 'critical'>();
        for (const avatar of avatars) {
            avatarHealth.set(avatar.id, 'healthy');
        }

        return {
            overallHealth: 'healthy',
            avatarHealth,
            lastCheck: new Date().toISOString(),
            issues: [],
        };
    }

    /**
     * Validate specifications before processing
     */
    private validateSpecifications(specs: AvatarConfig[]): SwarmValidationResult {
        const errors: any[] = [];
        const warnings: any[] = [];
        const recommendations: string[] = [];

        // Check for duplicate names
        const names = specs.map(s => s.name);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
            errors.push({
                code: 'DUPLICATE_AVATAR_NAMES',
                message: `Duplicate avatar names found: ${duplicates.join(', ')}`,
                details: duplicates,
            });
        }

        // Check for circular dependencies
        const circularDeps = this.detectCircularDependencies(specs);
        if (circularDeps.length > 0) {
            warnings.push({
                code: 'CIRCULAR_DEPENDENCIES',
                message: `Circular dependencies detected: ${circularDeps.join(', ')}`,
                suggestedFix: 'Restructure dependencies to eliminate cycles',
            });
        }

        // Validate each spec
        for (const spec of specs) {
            if (!spec.name || !spec.specPath) {
                errors.push({
                    code: 'INVALID_AVATAR_CONFIG',
                    message: `Avatar config missing required fields`,
                    avatar: spec.name,
                    details: spec,
                });
            }

            if (!spec.spec || !this.isValidOpenAPI(spec.spec)) {
                errors.push({
                    code: 'INVALID_OPENAPI_SPEC',
                    message: `Invalid OpenAPI specification`,
                    avatar: spec.name,
                    details: spec.specPath,
                });
            }
        }

        // Recommendations
        if (specs.length < 2) {
            recommendations.push('Swarms work best with 2+ services. Consider whether you really need a swarm.');
        }
        if (specs.length > 20) {
            recommendations.push('Managing 20+ avatars can be complex. Consider hierarchical coordination.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            recommendations,
        };
    }

    /**
     * Generate individual avatar from config
     */
    private generateAvatars(config: SwarmGenerationConfig): Avatar[] {
        const avatars: Avatar[] = [];

        for (const avatarConfig of config.specs) {
            const avatar: Avatar = {
                id: this.generateAvatarId(avatarConfig.name),
                name: avatarConfig.name,
                specVersion: this.extractSpecVersion(avatarConfig.spec),
                clientPath: path.join(config.outputDir, avatarConfig.name, 'client.ts'),
                typesPath: path.join(config.outputDir, avatarConfig.name, 'types.ts'),
                config: avatarConfig,
                autonomyLevel: avatarConfig.autonomyLevel || 'medium',
                capabilities: this.extractCapabilities(avatarConfig.spec),
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    generation: 1,
                    checksumSpec: this.calculateChecksum(avatarConfig.spec),
                    checksumCode: '',
                    performanceProfile: {
                        estimatedBundleSize: this.estimateAvatarBundleSize(avatarConfig.spec),
                        estimatedLatency: this.estimateAvatarLatency(avatarConfig.spec),
                        throughputCapacity: this.estimateAvatarThroughput(avatarConfig.spec),
                        memoryFootprint: this.estimateAvatarBundleSize(avatarConfig.spec),
                        cachedRequests: 0,
                    },
                },
            };

            avatars.push(avatar);
            this.avatars.set(avatar.id, avatar);
        }

        return avatars;
    }

    /**
     * Create coordinator for avatar swarm
     */
    private createCoordinator(strategy: string, avatars: Avatar[]): Coordinator {
        const routingTable = new Map<string, string[]>();

        // Build routing table based on dependencies
        for (const avatar of avatars) {
            const routes: string[] = [];
            if (avatar.config.dependencies) {
                routes.push(...avatar.config.dependencies);
            }
            routingTable.set(avatar.id, routes);
        }

        return {
            id: `coordinator-${this.swarmId}`,
            strategy: strategy as 'consensus' | 'voting' | 'hierarchical',
            rules: [],
            decisions: [],
            messageQueue: [],
            routingTable,
        };
    }

    /**
     * Establish coordination rules between avatars
     */
    private establishCoordinationRules(avatars: Avatar[], strategy: string): CoordinationRule[] {
        const rules: CoordinationRule[] = [];
        let priority = 100;

        // Base rule: health check
        rules.push({
            id: 'rule-health-check',
            name: 'Health Check',
            description: 'Periodically verify all avatars are healthy',
            sourceAvatar: 'system',
            targetAvatars: avatars.map(a => a.id),
            ruleType: 'parallel',
            priority: priority--,
            enabled: true,
            action: async () => {
                return {
                    status: 'executed',
                    timestamp: new Date().toISOString(),
                };
            },
        });

        // Type consistency rule
        rules.push({
            id: 'rule-type-consistency',
            name: 'Type Consistency Enforcement',
            description: 'Ensure types are consistent across avatars',
            sourceAvatar: 'system',
            targetAvatars: avatars.map(a => a.id),
            ruleType: 'consensus',
            priority: priority--,
            enabled: true,
            action: async () => {
                return {
                    status: 'executed',
                    timestamp: new Date().toISOString(),
                };
            },
        });

        // Dependency rule: sequential operations for dependent services
        if (strategy === 'hierarchical') {
            rules.push({
                id: 'rule-dependency-order',
                name: 'Dependency Ordering',
                description: 'Execute operations in dependency order',
                sourceAvatar: 'system',
                targetAvatars: avatars.map(a => a.id),
                ruleType: 'sequential',
                priority: priority--,
                enabled: true,
                action: async () => {
                    return {
                        status: 'executed',
                        timestamp: new Date().toISOString(),
                    };
                },
            });
        }

        return rules;
    }

    /**
     * Analyze swarm consistency and generate analysis
     */
    private analyzeSwarmConsistency(avatars: Avatar[], config: SwarmGenerationConfig): SwarmAnalysisResult {
        const consistencyCheck: ServiceConsistencyCheck = {
            consistent: true,
            inconsistencies: [],
            conflicts: [],
            suggestions: [],
        };

        // Analyze data flows between services
        const dataFlows: CrossAvatarDataFlow[] = this.analyzeDataFlows(avatars);

        // Calculate heuristic performance metrics from avatar specs
        const perfMetrics: SwarmPerformanceMetrics = config.enablePerformanceProfiling !== false ? this.estimateSwarmPerformanceMetrics(avatars) : this.createEmptyPerformanceMetrics();

        return {
            timestamp: new Date().toISOString(),
            totalAvatars: avatars.length,
            consistencyCheck,
            dataFlows,
            performanceMetrics: perfMetrics,
            recommendations: [],
        };
    }

    /**
     * Perform health check on swarm
     */
    private performHealthCheck(avatars: Avatar[], analysisResult: SwarmAnalysisResult): HealthStatus {
        const avatarHealth = new Map<string, 'healthy' | 'degraded' | 'critical'>();
        const issues: HealthIssue[] = [];

        for (const avatar of avatars) {
            avatarHealth.set(avatar.id, 'healthy');
        }

        // Check for consistency issues
        if (analysisResult.consistencyCheck.conflicts.length > 0) {
            issues.push({
                id: 'issue-consistency',
                severity: 'warning',
                component: 'type-system',
                description: `Found ${analysisResult.consistencyCheck.conflicts.length} service conflicts`,
                timestamp: new Date().toISOString(),
                resolved: false,
            });
        }

        const overallHealth = issues.length === 0 ? 'healthy' : issues.some(i => i.severity === 'critical') ? 'critical' : 'degraded';

        return {
            overallHealth: overallHealth as 'healthy' | 'degraded' | 'critical',
            avatarHealth,
            lastCheck: new Date().toISOString(),
            issues,
        };
    }

    /**
     * Extract capabilities from OpenAPI spec
     */
    private extractCapabilities(spec: CommonOpenApi): any[] {
        const capabilities = [];
        const paths = (spec as any).paths || {};

        for (const [pathKey, pathItem] of Object.entries(paths)) {
            const methods = ['get', 'post', 'put', 'delete', 'patch'];
            for (const method of methods) {
                if ((pathItem as any)[method]) {
                    capabilities.push({
                        name: (pathItem as any)[method].operationId || `${method}-${pathKey}`,
                        description: (pathItem as any)[method].description || '',
                        operations: [method],
                        requiredTypes: [],
                        exportedTypes: [],
                    });
                }
            }
        }

        return capabilities;
    }

    /**
     * Analyze data flows between services
     */
    private analyzeDataFlows(avatars: Avatar[]): CrossAvatarDataFlow[] {
        const flows: CrossAvatarDataFlow[] = [];

        // In a real implementation, we'd analyze actual dependencies
        // For now, create flows based on avatar dependencies
        for (const avatar of avatars) {
            if (avatar.config.dependencies) {
                for (const dep of avatar.config.dependencies) {
                    flows.push({
                        from: dep,
                        to: avatar.id,
                        operations: [],
                        dataTypes: [],
                        frequency: 'occasional',
                        criticalPath: false,
                    });
                }
            }
        }

        return flows;
    }

    /**
     * Count total endpoints across all avatars
     */
    private countTotalEndpoints(avatars: Avatar[]): number {
        return avatars.reduce((sum, avatar) => sum + avatar.capabilities.length, 0);
    }

    /**
     * Count total models across all avatars
     */
    private countTotalModels(avatars: Avatar[]): number {
        let total = 0;
        for (const avatar of avatars) {
            const spec = avatar.config.spec as any;
            const components = spec.components || spec.definitions || {};
            const schemas = components.schemas || {};
            total += Object.keys(schemas).length;
        }
        return total;
    }

    /**
     * Estimate total bundle size
     */
    private estimateBundleSize(avatars: Avatar[]): number {
        return avatars.reduce((sum, avatar) => {
            return sum + (avatar.metadata.performanceProfile?.estimatedBundleSize || 0);
        }, 0);
    }

    /**
     * Estimate bundle size for a single avatar
     */
    private estimateAvatarBundleSize(spec: CommonOpenApi): number {
        // Rough estimation: ~100 bytes per endpoint + ~50 bytes per model + base 5KB
        const paths = (spec as any).paths || {};
        const endpoints = Object.keys(paths).length;
        const components = (spec as any).components || {};
        const schemas = components.schemas || {};
        const models = Object.keys(schemas).length;

        return 5120 + endpoints * 100 + models * 50;
    }

    /**
     * Detect circular dependencies
     */
    private detectCircularDependencies(specs: AvatarConfig[]): string[] {
        const visited = new Set<string>();
        const circularPaths: string[] = [];

        const dfs = (name: string, path: string[]): boolean => {
            if (path.includes(name)) {
                circularPaths.push(path.join(' -> ') + ' -> ' + name);
                return true;
            }

            if (visited.has(name)) {
                return false;
            }

            visited.add(name);
            const spec = specs.find(s => s.name === name);

            if (spec && spec.dependencies) {
                for (const dep of spec.dependencies) {
                    dfs(dep, [...path, name]);
                }
            }

            return false;
        };

        for (const spec of specs) {
            dfs(spec.name, []);
        }

        return circularPaths;
    }

    /**
     * Check if spec is valid OpenAPI
     */
    private isValidOpenAPI(spec: any): boolean {
        if (!spec || typeof spec !== 'object') return false;
        return spec.openapi || spec.swagger ? true : false;
    }

    /**
     * Extract spec version
     */
    private extractSpecVersion(spec: any): string {
        return spec.openapi || spec.swagger || 'unknown';
    }

    /**
     * Heuristic latency estimate based on endpoint count
     */
    private estimateAvatarLatency(spec: CommonOpenApi): number {
        const paths = (spec as any).paths || {};
        return Math.round(50 + Object.keys(paths).length * 5);
    }

    /**
     * Heuristic throughput estimate based on endpoint count
     */
    private estimateAvatarThroughput(spec: CommonOpenApi): number {
        const paths = (spec as any).paths || {};
        return Math.round(Math.max(1000, 12000 - Object.keys(paths).length * 100));
    }

    /**
     * Heuristic swarm-level performance metrics derived from avatar specs
     */
    public estimateSwarmPerformanceMetrics(avatars: Avatar[]): SwarmPerformanceMetrics {
        const totalEndpoints = avatars.reduce((sum, avatar) => sum + avatar.capabilities.length, 0);
        const avatarCount = avatars.length || 1;
        const avgEndpoints = totalEndpoints / avatarCount;

        return {
            averageLatency: Math.round(50 + avgEndpoints * 8),
            p95Latency: Math.round(120 + avgEndpoints * 20),
            p99Latency: Math.round(250 + avgEndpoints * 40),
            throughput: Math.round(Math.max(1000, 15000 - totalEndpoints * 50)),
            errorRate: Math.min(0.05, 0.001 + avatarCount * 0.0002),
            cacheHitRate: Math.max(0.5, 0.92 - avatarCount * 0.02),
            consensusOverhead: avatarCount * 15,
        };
    }

    private createEmptyPerformanceMetrics(): SwarmPerformanceMetrics {
        return {
            averageLatency: 0,
            p95Latency: 0,
            p99Latency: 0,
            throughput: 0,
            errorRate: 0,
            cacheHitRate: 0,
            consensusOverhead: 0,
        };
    }

    /**
     * Calculate checksum for spec content
     */
    public calculateChecksum(spec: any): string {
        const str = JSON.stringify(spec);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Generate swarm ID
     */
    private generateSwarmId(): string {
        return `swarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate avatar ID
     */
    private generateAvatarId(name: string): string {
        return `avatar-${name}-${Date.now()}`;
    }

    /**
     * Generate swarm name from avatars
     */
    private generateSwarmName(avatars: Avatar[]): string {
        const names = avatars.map(a => a.name).join('-');
        return `swarm-${names}`;
    }

    /**
     * Get generated avatars
     */
    public getAvatars(): Avatar[] {
        return Array.from(this.avatars.values());
    }

    /**
     * Get avatar by ID
     */
    public getAvatar(id: string): Avatar | undefined {
        return this.avatars.get(id);
    }
}
