import { ValidationLibrary } from '../../../types/enums/ValidationLibrary.enum';
import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class ExistingValidatorsRule implements DetectionRule {
    readonly id = 'existing-validators';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        const validators = analysis.packageJson.existingValidators;

        if (ctx.allDeps.zod) validators.push(ValidationLibrary.ZOD);
        if (ctx.allDeps.joi) validators.push(ValidationLibrary.JOI);
        if (ctx.allDeps.yup) validators.push(ValidationLibrary.YUP);
    }
}
