import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class TreeShakingRule implements DetectionRule {
    readonly id = 'tree-shaking';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (!ctx.packageJson) {
            return;
        }

        analysis.bundleSize.hasTreeShaking = ctx.packageJson.sideEffects === false;
    }
}
