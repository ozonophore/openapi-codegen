import type { GovernancePolicyConfig } from '../governance/evaluateGovernanceRules';
import { analyzeOpenApiDiff } from '../semanticDiff/analyzeOpenApiDiff';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { adaptSemanticToChangeDetection } from '../utils/adapters/semanticToChangeDetection';
import { ChangeDetectionResult, ChangeDetectorConfig } from './types';

export type DetectChangesOptions = {
    allowBreaking?: boolean;
    governanceConfig?: GovernancePolicyConfig;
};

export class ChangeDetector {
    private readonly DEFAULT_CONFIG: ChangeDetectorConfig = {
        enabled: true,
        checkIntervalMs: 3600000, // 1 hour
        specUrl: '',
    };

    /**
     * Detect changes between two OpenAPI specifications
     */
    public detectChanges(oldSpec: any, newSpec: any, options: DetectChangesOptions = {}): ChangeDetectionResult {
        const report = analyzeOpenApiDiff(oldSpec as CommonOpenApi, newSpec as CommonOpenApi, {
            allowBreaking: options.allowBreaking,
            governanceConfig: options.governanceConfig,
        });
        return adaptSemanticToChangeDetection(report, { allowBreaking: options.allowBreaking });
    }
}
