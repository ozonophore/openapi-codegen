/**
 * Phase 2: Gradual Migration Types
 */

import type { GovernancePolicyConfig } from '../governance/evaluateGovernanceRules';

export interface MigrationPhase {
    name: string;
    traffic: {
        old: number;
        new: number;
    };
    duration: string;
    checkpoints?: string[];
    rollbackCondition?: string;
}

export interface MigrationConfig {
    enabled?: boolean;
    strategy?: 'canary' | 'blue-green' | 'shadow' | 'staged';
    phaseCount?: number;
    phaseDuration?: string;
    checkpointFrequency?: string;
    rollbackThreshold?: number;
    enableMonitoring?: boolean;
    enableMetrics?: boolean;
}

export interface MigrationPlan {
    id: string;
    timestamp: string;
    strategy: string;
    phases: MigrationPhase[];
    estimatedDuration: string;
    rollbackPlan: RollbackPlan;
    preflightChecks: PreflightCheck[];
    postMigrationValidation: ValidationCheck[];
}

export interface RollbackPlan {
    triggers: string[];
    strategy: 'immediate' | 'gradual' | 'manual';
    recoveryTime: string;
    dataConsistencyChecks: string[];
}

export interface PreflightCheck {
    name: string;
    description: string;
    command?: string;
    expectedResult?: string;
    critical: boolean;
}

export interface ValidationCheck {
    name: string;
    description: string;
    metricsToCheck: string[];
    successCriteria: string;
}

export interface TrafficSplitterConfig {
    enabled?: boolean;
    strategy?: 'round-robin' | 'weighted' | 'header-based' | 'header-and-weighted';
    oldClientWeight?: number;
    newClientWeight?: number;
    headerName?: string;
    headerValues?: {
        old: string;
        new: string;
    };
    stickySessions?: boolean;
    sessionDuration?: string;
}

export interface TrafficSplittingResult {
    clientKey: string;
    isNewClient: boolean;
    weight: number;
    reason: string;
}

export interface ChangeDetectorConfig {
    enabled?: boolean;
    checkIntervalMs?: number;
    specUrl: string;
    localSpecPath?: string;
}

export interface SpecChange {
    type: 'breaking' | 'non-breaking' | 'deprecation' | 'addition';
    path: string;
    oldValue?: any;
    newValue?: any;
    description: string;
    affectedEndpoints?: string[];
    migrationRequired: boolean;
    workaround?: string;
}

export interface ChangeDetectionResult {
    hasChanges: boolean;
    changes: SpecChange[];
    summary: string;
    autoApplicable: boolean;
    requiresUserReview: boolean;
    suggestedActions: string[];
}

export interface SelfHealingConfig {
    enabled?: boolean;
    monitorInterval?: number;
    autoApplyNonBreaking?: boolean;
    notifyOnBreaking?: boolean;
    createBackupBeforeApply?: boolean;
    rollbackOnFailure?: boolean;
    logFilePath?: string;
    allowBreaking?: boolean;
    governanceConfig?: GovernancePolicyConfig;
}

export interface HealingEvent {
    timestamp: string;
    type: 'spec-change-detected' | 'auto-applied' | 'user-review-required' | 'rollback' | 'error';
    change?: SpecChange;
    status: 'success' | 'pending' | 'failed' | 'manual-review';
    details: string;
    specWritten?: boolean;
    rollbackInfo?: {
        previousVersion: string;
        timestamp: string;
    };
}

export type { AnomalyExploitationConfig, ExploitationResult, OptimizationOpportunity } from '../analysis/types';
