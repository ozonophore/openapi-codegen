import type { SemanticDiffChange } from '../semanticDiff/analyzeOpenApiDiff';
import { extractBreakingChangeCategories } from './extractBreakingChangesFromDiffReport';
import { MigrationConfig, MigrationPhase, MigrationPlan, PreflightCheck, RollbackPlan, ValidationCheck } from './types';

export class GradualMigrationPlanner {
    private readonly DEFAULT_CONFIG: MigrationConfig = {
        enabled: true,
        strategy: 'canary',
        phaseCount: 4,
        phaseDuration: '1h',
        checkpointFrequency: '15m',
        rollbackThreshold: 5,
        enableMonitoring: true,
        enableMetrics: true,
    };

    /**
     * Generate a unique ID
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Plan a gradual migration from old client to new client
     */
    public planMigration(oldClientName: string, newClientName: string, config?: Partial<MigrationConfig>, breakingChanges?: SemanticDiffChange[]): MigrationPlan {
        const mergedConfig = this.tuneConfigForBreakingChanges({ ...this.DEFAULT_CONFIG, ...config }, breakingChanges);

        const strategy = mergedConfig.strategy || 'canary';
        const phases = this.generatePhases(strategy, mergedConfig);
        const preflightChecks = this.generatePreflightChecks(oldClientName, newClientName, breakingChanges);
        const postMigrationValidation = this.generatePostMigrationValidation(mergedConfig);
        const rollbackPlan = this.generateRollbackPlan(mergedConfig);

        return {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            strategy,
            phases,
            estimatedDuration: this.calculateEstimatedDuration(phases),
            rollbackPlan,
            preflightChecks,
            postMigrationValidation,
        };
    }

    /**
     * Generate phases based on strategy
     */
    private generatePhases(strategy: string, config: MigrationConfig): MigrationPhase[] {
        const phaseCount = config.phaseCount || 4;
        const phaseDuration = config.phaseDuration || '1h';

        switch (strategy) {
            case 'canary':
                return this.generateCanaryPhases(phaseCount, phaseDuration, config);
            case 'blue-green':
                return this.generateBlueGreenPhases(phaseDuration, config);
            case 'shadow':
                return this.generateShadowPhases(phaseCount, phaseDuration, config);
            case 'staged':
                return this.generateStagedPhases(phaseCount, phaseDuration, config);
            default:
                return this.generateCanaryPhases(phaseCount, phaseDuration, config);
        }
    }

    /**
     * Generate canary phases: Gradual traffic shift from 0% to 100% new
     */
    private generateCanaryPhases(phaseCount: number, phaseDuration: string, config: MigrationConfig): MigrationPhase[] {
        const phases: MigrationPhase[] = [];
        const trafficIncrement = 1 / phaseCount;
        const rollbackThreshold = config.rollbackThreshold ?? 5;

        for (let i = 0; i < phaseCount; i++) {
            const newTraffic = Math.round((i + 1) * trafficIncrement * 100) / 100;
            const oldTraffic = Math.round((1 - newTraffic) * 100) / 100;

            phases.push({
                name: `Canary Phase ${i + 1}/${phaseCount}`,
                traffic: {
                    old: oldTraffic,
                    new: newTraffic,
                },
                duration: phaseDuration,
                checkpoints: this.generateCheckpoints(i + 1, phaseCount, config),
                rollbackCondition: `Error rate > ${rollbackThreshold}% OR latency > 2x baseline`,
            });
        }

        return phases;
    }

    /**
     * Generate blue-green phases: Two identical environments
     */
    private generateBlueGreenPhases(phaseDuration: string, config: MigrationConfig): MigrationPhase[] {
        const rollbackThreshold = config.rollbackThreshold ?? 5;

        return [
            {
                name: 'Blue-Green Setup',
                traffic: {
                    old: 1,
                    new: 0,
                },
                duration: '30m',
                checkpoints: ['Deploy new client to green environment', 'Run smoke tests', 'Health checks pass'],
            },
            {
                name: 'Blue-Green Validation',
                traffic: {
                    old: 1,
                    new: 0,
                },
                duration: phaseDuration,
                checkpoints: ['Run comprehensive tests on green', 'Load testing', 'Latency benchmarking'],
                rollbackCondition: 'Any test failure',
            },
            {
                name: 'Blue-Green Cutover',
                traffic: {
                    old: 0,
                    new: 1,
                },
                duration: '5m',
                checkpoints: ['Switch load balancer', 'Monitor for errors'],
                rollbackCondition: `Error rate > ${rollbackThreshold}% within 2 minutes`,
            },
        ];
    }

    /**
     * Generate shadow phases: New client runs in parallel without affecting users
     */
    private generateShadowPhases(phaseCount: number, phaseDuration: string, config: MigrationConfig): MigrationPhase[] {
        const phases: MigrationPhase[] = [];
        const rollbackThreshold = config.rollbackThreshold ?? 5;

        for (let i = 0; i < phaseCount; i++) {
            phases.push({
                name: `Shadow Phase ${i + 1}/${phaseCount}`,
                traffic: {
                    old: 1,
                    new: 0,
                },
                duration: phaseDuration,
                checkpoints: [`Compare responses between old and new client (${(i + 1) * 25}% request sample)`, 'Verify response consistency', 'Check latency differences'],
                rollbackCondition: 'Response discrepancies > 1%',
            });
        }

        // Final cutover phase
        phases.push({
            name: 'Shadow Cutover',
            traffic: {
                old: 0,
                new: 1,
            },
            duration: '30m',
            checkpoints: ['Switch to new client', 'Monitor error rates', 'Verify all requests succeed'],
            rollbackCondition: `Error rate > ${rollbackThreshold}%`,
        });

        return phases;
    }

    /**
     * Generate staged phases: Deploy to different environments
     */
    private generateStagedPhases(phaseCount: number, phaseDuration: string, config: MigrationConfig): MigrationPhase[] {
        const stages = ['development', 'staging', 'canary', 'production'];
        const phases: MigrationPhase[] = [];
        const rollbackThreshold = config.rollbackThreshold ?? 5;

        for (let i = 0; i < Math.min(phaseCount, stages.length); i++) {
            const stageName = stages[i];
            const trafficPercentage = i === stages.length - 1 ? 1 : 0;

            phases.push({
                name: `${stageName.charAt(0).toUpperCase() + stageName.slice(1)} Stage`,
                traffic: {
                    old: 1 - trafficPercentage,
                    new: trafficPercentage,
                },
                duration: stageName === 'production' ? '2h' : phaseDuration,
                checkpoints: [`Deploy to ${stageName}`, 'Run integration tests', 'Monitor metrics', 'Get approval'],
                rollbackCondition: stageName === 'production' ? `Error rate > ${rollbackThreshold}%` : 'Any test failure',
            });
        }

        return phases;
    }

    /**
     * Generate checkpoints for a migration phase
     */
    private generateCheckpoints(phaseNumber: number, totalPhases: number, config: MigrationConfig): string[] {
        const checkpointFrequency = config.checkpointFrequency ?? '15m';

        return [
            `Monitor error rate every ${checkpointFrequency}`,
            `Verify latency remains within acceptable range`,
            `Check for any degradation in response times`,
            `Validate that ${phaseNumber * Math.round(100 / totalPhases)}% traffic on new client`,
            `No alerts triggered`,
        ];
    }

    /**
     * Auto-tune phase count and strategy based on breaking change count from diff report.
     */
    private tuneConfigForBreakingChanges(config: MigrationConfig, breakingChanges?: SemanticDiffChange[]): MigrationConfig {
        const breakingCount = breakingChanges?.length ?? 0;
        if (breakingCount === 0) {
            return config;
        }

        const tuned = { ...config };

        if (breakingCount >= 3) {
            tuned.strategy = 'shadow';
            tuned.phaseCount = Math.min(10, Math.max(tuned.phaseCount ?? 4, breakingCount + 2));
        } else {
            tuned.strategy = tuned.strategy ?? 'canary';
            tuned.phaseCount = Math.min(8, Math.max(tuned.phaseCount ?? 4, breakingCount + 3));
        }

        return tuned;
    }

    /**
     * Generate preflight checks
     */
    private generatePreflightChecks(oldClientName: string, newClientName: string, breakingChanges?: SemanticDiffChange[]): PreflightCheck[] {
        const checks: PreflightCheck[] = [
            {
                name: 'Backup Current Configuration',
                description: `Backup existing ${oldClientName} client configuration and generated code`,
                command: 'git commit -m "Pre-migration backup"',
                critical: true,
            },
            {
                name: 'Verify New Client Generation',
                description: `Ensure ${newClientName} client can be generated without errors`,
                command: 'npm run generate',
                expectedResult: 'Generation succeeds without errors',
                critical: true,
            },
            {
                name: 'Type Compatibility Check',
                description: 'Verify type compatibility between old and new clients',
                command: 'npm run type-check',
                expectedResult: 'No type errors',
                critical: true,
            },
            {
                name: 'Unit Tests Pass',
                description: 'All existing unit tests must pass before migration',
                command: 'npm test',
                expectedResult: 'All tests pass',
                critical: true,
            },
            {
                name: 'Integration Tests Pass',
                description: 'Integration tests against test API',
                command: 'npm run test:integration',
                expectedResult: 'All integration tests pass',
                critical: false,
            },
            {
                name: 'Bundle Size Analysis',
                description: 'Analyze bundle size difference',
                command: 'npm run analyze:bundle',
                critical: false,
            },
            {
                name: 'Performance Baseline',
                description: 'Establish performance baseline with current client',
                command: 'npm run benchmark:current',
                critical: false,
            },
        ];

        const breakingCount = breakingChanges?.length ?? 0;
        if (breakingCount > 0) {
            const categories = extractBreakingChangeCategories(breakingChanges!);
            const categorySummary = Object.entries(categories)
                .map(([category, count]) => `${category}: ${count}`)
                .join(', ');

            checks.unshift({
                name: 'Review OpenAPI Breaking Changes',
                description: `Breaking changes detected: ${breakingCount}${categorySummary ? ` (${categorySummary})` : ''}`,
                critical: true,
            });
        }

        return checks;
    }

    /**
     * Generate post-migration validation checks
     */
    private generatePostMigrationValidation(config: MigrationConfig): ValidationCheck[] {
        const checks: ValidationCheck[] = [
            {
                name: 'Error Rate Validation',
                description: 'Verify error rate remains below threshold',
                metricsToCheck: ['error-rate', 'http-error-rate', 'exceptions'],
                successCriteria: 'Error rate < 0.5%',
            },
            {
                name: 'Latency Validation',
                description: 'Ensure latency has not regressed significantly',
                metricsToCheck: ['response-time-p50', 'response-time-p95', 'response-time-p99'],
                successCriteria: 'p95 latency <= 1.2x baseline',
            },
            {
                name: 'Throughput Validation',
                description: 'Verify throughput meets expectations',
                metricsToCheck: ['requests-per-second', 'successful-requests', 'failed-requests'],
                successCriteria: 'RPS >= 95% of baseline',
            },
            {
                name: 'Resource Usage Validation',
                description: 'Check memory and CPU usage',
                metricsToCheck: ['memory-usage', 'cpu-usage', 'connection-count'],
                successCriteria: 'No significant resource increase',
            },
            {
                name: 'Data Consistency Validation',
                description: 'Validate data integrity and consistency',
                metricsToCheck: ['data-validation-errors', 'type-mismatches'],
                successCriteria: 'Zero data consistency issues',
            },
            {
                name: 'User Impact Assessment',
                description: 'Monitor real user impact metrics',
                metricsToCheck: ['user-sessions', 'feature-usage', 'user-errors'],
                successCriteria: 'No user-reported issues',
            },
        ];

        if (config.enableMetrics === false) {
            return checks.map(check => ({
                ...check,
                metricsToCheck: [],
            }));
        }

        return checks;
    }

    /**
     * Generate rollback plan
     */
    private generateRollbackPlan(config: MigrationConfig): RollbackPlan {
        const rollbackThreshold = config.rollbackThreshold ?? 5;

        return {
            triggers: [
                `Error rate > ${rollbackThreshold}%`,
                'Latency > 3x baseline',
                'Critical bugs detected',
                'Data corruption detected',
                'Manual rollback requested',
                'Timeout waiting for phase checkpoint',
            ],
            strategy: 'gradual',
            recoveryTime: '15 minutes',
            dataConsistencyChecks: ['Verify all cached data is consistent', 'Check for orphaned connections', 'Validate transaction state', 'Clear stale cache entries', 'Reset traffic routing'],
        };
    }

    /**
     * Calculate estimated total migration duration
     */
    private calculateEstimatedDuration(phases: MigrationPhase[]): string {
        let totalMinutes = 0;

        for (const phase of phases) {
            const minutes = this.parseDurationToMinutes(phase.duration);
            totalMinutes += minutes;
        }

        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        if (hours === 0) {
            return `${remainingMinutes}m`;
        } else if (remainingMinutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${remainingMinutes}m`;
        }
    }

    /**
     * Parse duration string to minutes
     */
    private parseDurationToMinutes(duration: string): number {
        const match = duration.match(/(\d+)([mh])/);
        if (!match) return 60;

        const value = parseInt(match[1], 10);
        const unit = match[2];

        return unit === 'h' ? value * 60 : value;
    }
}
