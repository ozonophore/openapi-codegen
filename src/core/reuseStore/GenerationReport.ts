import { dirname } from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { SpecAnalysisReport } from '../specAnalysis/types';
import type { ReuseConflictErrorDetails, ReuseStoreManifest } from './types';

export type SpecGenerationStats = {
    specItem: string;
    input: string;
    durationMs: number;
    reuseHits: number;
    reuseMisses: number;
};

export type ReuseConflictRecord = ReuseConflictErrorDetails & {
    timestamp: string;
};

export type CrossSpecSharedArtifact = {
    name: string;
    kind: string;
    artifactKey: string;
    specItems: string[];
};

export type CrossSpecAnalysisResult = {
    sharedArtifacts: CrossSpecSharedArtifact[];
    totalShared: number;
    uniqueArtifacts: number;
};

export type GenerationReport = {
    generatedAt: string;
    generatorVersion: string;
    specs: SpecGenerationStats[];
    reuse: {
        totalHits: number;
        totalMisses: number;
        conflicts: ReuseConflictRecord[];
    };
    crossSpec?: CrossSpecAnalysisResult;
    specQuality?: SpecAnalysisReport & { failOnHighTriggered?: boolean };
    phases?: {
        manifestLoadMs?: number;
        manifestSaveMs?: number;
        gcMs?: number;
    };
};

export function analyzeCrossSpecManifest(manifest: ReuseStoreManifest): CrossSpecAnalysisResult {
    const sharedArtifacts: CrossSpecSharedArtifact[] = [];

    for (const entry of Object.values(manifest.artifacts)) {
        const specItems = Array.from(new Set(entry.referencedBy.map(ref => ref.specItem)));
        if (specItems.length > 1) {
            sharedArtifacts.push({
                name: entry.name,
                kind: entry.kind,
                artifactKey: entry.artifactKey,
                specItems,
            });
        }
    }

    return {
        sharedArtifacts,
        totalShared: sharedArtifacts.length,
        uniqueArtifacts: Object.keys(manifest.artifacts).length,
    };
}

export async function writeGenerationReport(storePath: string, report: GenerationReport): Promise<string> {
    const reportsDir = resolveHelper(process.cwd(), storePath, 'reports');
    const latestPath = resolveHelper(reportsDir, 'latest.json');
    await fileSystemHelpers.mkdir(dirname(latestPath));
    await fileSystemHelpers.writeFile(latestPath, JSON.stringify(report, null, 2));
    return latestPath;
}
