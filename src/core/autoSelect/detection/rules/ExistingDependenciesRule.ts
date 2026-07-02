import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class ExistingDependenciesRule implements DetectionRule {
    readonly id = 'existing-dependencies';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (!ctx.packageJson) {
            return;
        }

        analysis.existingDependencies = {
            ...ctx.dependencies,
            ...ctx.devDependencies,
        };
    }
}
