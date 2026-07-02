import * as fs from 'fs';
import * as path from 'path';

import { DEFAULT_DETECTION_RULES } from '../autoSelect/detection/defaultDetectionRules';
import { createPackageJsonContext } from '../autoSelect/detection/helpers';
import { runDetectionRules } from '../autoSelect/detection/runDetectionRules';
import type { DetectionRule } from '../autoSelect/detection/types';
import type { ProjectAnalysis } from '../autoSelect/types';
import { ProjectContext } from './ProjectContext';
import type { ConsumerProjectInfo, ProbeOptions, ProjectContextOptions, UnifiedProjectProfile } from './types';

export interface ProbePackageJsonOptions {
    detectionRules?: DetectionRule[];
}

export class ProjectProbe {
    public static resolvePackageJsonPath(dir: string): string | undefined {
        const candidate = path.join(dir, 'package.json');
        return fs.existsSync(candidate) ? candidate : undefined;
    }

    public static resolveTsConfigPath(dir: string, explicit?: string): string | undefined {
        if (explicit) {
            return path.resolve(explicit);
        }

        const candidate = path.join(dir, 'tsconfig.json');
        return fs.existsSync(candidate) ? candidate : undefined;
    }

    public static probePackageJson(dir: string, options?: ProbePackageJsonOptions): ProjectAnalysis {
        const packageJson = ProjectProbe.readPackageJson(dir);
        const ctx = createPackageJsonContext(dir, packageJson);
        const rules = [...DEFAULT_DETECTION_RULES, ...(options?.detectionRules ?? [])];

        return runDetectionRules(ctx, rules);
    }

    public static probeConsumerProject(opts: ProjectContextOptions): ConsumerProjectInfo {
        const projectPath = path.resolve(opts.projectPath);
        const tsconfigPath = ProjectProbe.resolveTsConfigPath(projectPath, opts.tsconfigPath);
        const packageJsonPath = ProjectProbe.resolvePackageJsonPath(projectPath);

        return {
            projectPath,
            tsconfigPath,
            packageJsonPath,
            context: new ProjectContext(projectPath, tsconfigPath),
        };
    }

    public static probe(opts: ProbeOptions): UnifiedProjectProfile {
        const dir = path.resolve(opts.dir);
        const tsconfigPath = ProjectProbe.resolveTsConfigPath(dir, opts.tsconfigPath);
        const packageJsonPath = ProjectProbe.resolvePackageJsonPath(dir);

        return {
            dir,
            packageJson: ProjectProbe.probePackageJson(dir),
            packageJsonPath,
            tsconfigPath,
            consumer: ProjectProbe.probeConsumerProject({
                projectPath: dir,
                tsconfigPath,
            }),
        };
    }

    private static readPackageJson(dir: string): Record<string, unknown> | null {
        try {
            const packageJsonPath = path.join(dir, 'package.json');
            const content = fs.readFileSync(packageJsonPath, 'utf-8');
            return JSON.parse(content) as Record<string, unknown>;
        } catch {
            return null;
        }
    }
}
