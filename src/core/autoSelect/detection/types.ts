import type { ProjectAnalysis } from '../types';

export interface PackageJsonContext {
    targetDir: string;
    packageJson: Record<string, unknown> | null;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    allDeps: Record<string, string>;
    scripts: Record<string, string>;
}

export interface DetectionRule {
    id: string;
    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void;
}
