import type { PackageJsonMetadata, ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class PackageJsonMetadataRule implements DetectionRule {
    readonly id = 'package-json-metadata';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (!ctx.packageJson) {
            return;
        }

        try {
            const metadata: PackageJsonMetadata = {
                existingValidators: analysis.packageJson.existingValidators,
                existingHttpClients: analysis.packageJson.existingHttpClients,
                name: ctx.packageJson.name as string | undefined,
                type: ctx.packageJson.type === 'module' || ctx.packageJson.type === 'commonjs' ? ctx.packageJson.type : undefined,
                engines: ctx.packageJson.engines as PackageJsonMetadata['engines'],
            };

            analysis.packageJson = metadata;
        } catch {
            // Keep empty metadata from createEmptyAnalysis
        }
    }
}
