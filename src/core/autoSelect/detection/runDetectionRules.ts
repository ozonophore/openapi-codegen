import type { ProjectAnalysis } from '../types';
import { createEmptyAnalysis } from './helpers';
import type { DetectionRule, PackageJsonContext } from './types';

export function runDetectionRules(ctx: PackageJsonContext, rules: DetectionRule[]): ProjectAnalysis {
    const analysis = createEmptyAnalysis();

    for (const rule of rules) {
        rule.apply(ctx, analysis);
    }

    return analysis;
}
