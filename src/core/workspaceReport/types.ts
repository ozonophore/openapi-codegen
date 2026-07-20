import type { CrossSpecAnalysisResult, SpecGenerationStats } from '../reuseStore/GenerationReport';

export type WorkspaceSpecSummary = {
    name: string;
    input: string;
    durationMs: number;
    reuseHits: number;
    reuseMisses: number;
};

export type WorkspaceReportSummary = {
    totalSpecs: number;
    totalDurationMs: number;
    totalReuseHits: number;
    totalReuseMisses: number;
    totalSharedModels: number;
};

export type WorkspaceReport = {
    generatedAt: string;
    specs: WorkspaceSpecSummary[];
    crossSpec: CrossSpecAnalysisResult | null;
    summary: WorkspaceReportSummary;
};

export type WorkspaceReportConfig = {
    enabled?: boolean;
    path?: string;
    format?: 'json' | 'markdown' | 'both';
};

export type { SpecGenerationStats };
