import type { ProjectAnalysis } from '../../types';
import { setDeploymentTargetIfUnknown } from '../helpers';
import type { DetectionRule, PackageJsonContext } from '../types';

export class EdgeFunctionsDeploymentRule implements DetectionRule {
    readonly id = 'edge-functions-deployment';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (ctx.allDeps['@netlify/functions'] || ctx.allDeps['aws-lambda'] || ctx.allDeps['@vercel/functions']) {
            setDeploymentTargetIfUnknown(analysis, 'edge');
        }
    }
}
