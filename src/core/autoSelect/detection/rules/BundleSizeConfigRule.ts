import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class BundleSizeConfigRule implements DetectionRule {
    readonly id = 'bundle-size-config';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (ctx.packageJson?.bundlesize) {
            analysis.performanceRequirements.requiresSmallBundle = true;
        }
    }
}
