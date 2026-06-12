import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class VercelEdgeRule implements DetectionRule {
    readonly id = 'vercel-edge';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (ctx.scripts.deploy?.includes('vercel') || ctx.devDependencies.vercel) {
            analysis.performanceRequirements.isEdgeFunction = true;
        }
    }
}
