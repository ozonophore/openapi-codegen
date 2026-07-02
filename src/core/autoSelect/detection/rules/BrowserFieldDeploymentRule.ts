import type { ProjectAnalysis } from '../../types';
import { setDeploymentTargetIfUnknown } from '../helpers';
import type { DetectionRule, PackageJsonContext } from '../types';

export class BrowserFieldDeploymentRule implements DetectionRule {
    readonly id = 'browser-field-deployment';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (ctx.packageJson?.browser) {
            setDeploymentTargetIfUnknown(analysis, 'browser');
        }
    }
}
