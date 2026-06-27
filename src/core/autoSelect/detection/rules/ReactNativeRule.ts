import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class ReactNativeRule implements DetectionRule {
    readonly id = 'react-native';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (!ctx.dependencies['react-native']) {
            return;
        }

        analysis.performanceRequirements.isMobileTarget = true;
        analysis.performanceRequirements.requiresSmallBundle = true;
        analysis.deploymentTarget = 'react-native';
    }
}
