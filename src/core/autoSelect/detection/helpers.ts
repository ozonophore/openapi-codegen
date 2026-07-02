import type { DeploymentTarget, ProjectAnalysis } from '../types';
import type { PackageJsonContext } from './types';

export function createEmptyAnalysis(): ProjectAnalysis {
    return {
        packageJson: {
            existingValidators: [],
            existingHttpClients: [],
        },
        bundleSize: {
            estimatedMinified: 0,
            hasTreeShaking: false,
            hasBundler: false,
        },
        performanceRequirements: {
            isMobileTarget: false,
            isEdgeFunction: false,
            requiresSmallBundle: false,
            requiresHighThroughput: false,
            hasBatchEndpoints: false,
        },
        existingDependencies: {},
        deploymentTarget: 'unknown',
    };
}

export function createPackageJsonContext(targetDir: string, packageJson: Record<string, unknown> | null): PackageJsonContext {
    if (!packageJson) {
        return {
            targetDir,
            packageJson: null,
            dependencies: {},
            devDependencies: {},
            allDeps: {},
            scripts: {},
        };
    }

    const dependencies = (packageJson.dependencies as Record<string, string> | undefined) ?? {};
    const devDependencies = (packageJson.devDependencies as Record<string, string> | undefined) ?? {};
    const scripts = (packageJson.scripts as Record<string, string> | undefined) ?? {};

    return {
        targetDir,
        packageJson,
        dependencies,
        devDependencies,
        allDeps: { ...dependencies, ...devDependencies },
        scripts,
    };
}

export function setDeploymentTargetIfUnknown(analysis: ProjectAnalysis, target: DeploymentTarget): void {
    if (analysis.deploymentTarget === 'unknown') {
        analysis.deploymentTarget = target;
    }
}
