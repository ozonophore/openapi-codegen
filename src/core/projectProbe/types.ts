import type { ProjectAnalysis } from '../autoSelect/types';
import type { ProjectContext } from './ProjectContext';

export interface ProjectContextOptions {
    projectPath: string;
    tsconfigPath?: string;
}

export interface ProbeOptions {
    dir: string;
    tsconfigPath?: string;
}

export interface ConsumerProjectInfo {
    projectPath: string;
    tsconfigPath?: string;
    packageJsonPath?: string;
    context: ProjectContext;
}

export interface UnifiedProjectProfile {
    dir: string;
    packageJson: ProjectAnalysis;
    packageJsonPath?: string;
    tsconfigPath?: string;
    consumer: ConsumerProjectInfo;
}
