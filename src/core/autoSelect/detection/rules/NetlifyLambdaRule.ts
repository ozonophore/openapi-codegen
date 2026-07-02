import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class NetlifyLambdaRule implements DetectionRule {
    readonly id = 'netlify-lambda';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (ctx.devDependencies['@netlify/functions'] || ctx.devDependencies['aws-lambda']) {
            analysis.performanceRequirements.isEdgeFunction = true;
            analysis.performanceRequirements.requiresSmallBundle = true;
        }
    }
}
