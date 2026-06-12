import type { BundleSizeMetadata } from '../../types';
import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class BundlerRule implements DetectionRule {
    readonly id = 'bundler';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        if (!ctx.packageJson) {
            return;
        }

        let bundlerType: BundleSizeMetadata['bundlerType'] = undefined;

        if (ctx.devDependencies.webpack) {
            bundlerType = 'webpack';
        } else if (ctx.devDependencies.esbuild) {
            bundlerType = 'esbuild';
        } else if (ctx.devDependencies.rollup) {
            bundlerType = 'rollup';
        } else if (ctx.devDependencies.vite) {
            bundlerType = 'vite';
        }

        if (bundlerType) {
            analysis.bundleSize.hasBundler = true;
            analysis.bundleSize.bundlerType = bundlerType;
        }
    }
}
