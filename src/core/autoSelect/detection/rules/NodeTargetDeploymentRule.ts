import type { ProjectAnalysis } from '../../types';
import { setDeploymentTargetIfUnknown } from '../helpers';
import type { DetectionRule, PackageJsonContext } from '../types';

export class NodeTargetDeploymentRule implements DetectionRule {
    readonly id = 'node-target-deployment';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (!ctx.packageJson) {
            return;
        }

        const engines = ctx.packageJson.engines as { node?: string } | undefined;

        if (ctx.packageJson.type === 'module' || engines?.node) {
            setDeploymentTargetIfUnknown(analysis, 'nodejs');
        }
    }
}
