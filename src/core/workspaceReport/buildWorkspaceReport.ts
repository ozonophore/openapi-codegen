import { analyzeCrossSpecManifest, type SpecGenerationStats } from '../reuseStore/GenerationReport';
import type { ReuseStore } from '../reuseStore/ReuseStore';
import type { WorkspaceReport, WorkspaceSpecSummary } from './types';

export function buildWorkspaceReport(specStats: SpecGenerationStats[], reuseStore: ReuseStore | null): WorkspaceReport {
    const specs: WorkspaceSpecSummary[] = specStats.map(s => ({
        name: s.specItem,
        input: s.input,
        durationMs: s.durationMs,
        reuseHits: s.reuseHits,
        reuseMisses: s.reuseMisses,
    }));

    const crossSpec = reuseStore ? analyzeCrossSpecManifest(reuseStore.getManifest()) : null;

    const summary = {
        totalSpecs: specs.length,
        totalDurationMs: specs.reduce((sum, s) => sum + s.durationMs, 0),
        totalReuseHits: specs.reduce((sum, s) => sum + s.reuseHits, 0),
        totalReuseMisses: specs.reduce((sum, s) => sum + s.reuseMisses, 0),
        totalSharedModels: crossSpec?.totalShared ?? 0,
    };

    return {
        generatedAt: new Date().toISOString(),
        specs,
        crossSpec,
        summary,
    };
}
