import type { ProjectAnalysis } from '../../types';
import { setDeploymentTargetIfUnknown } from '../helpers';
import type { DetectionRule, PackageJsonContext } from '../types';

export class BrowserFrameworkDeploymentRule implements DetectionRule {
    readonly id = 'browser-framework-deployment';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (ctx.allDeps.next || ctx.allDeps.react) {
            setDeploymentTargetIfUnknown(analysis, 'browser');
        }
    }
}
