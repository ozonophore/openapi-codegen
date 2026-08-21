import { promises as fsPromises } from 'fs';

import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import type { TEslintFixOptions } from '../common/TEslintFixOptions';
import type { TStrictFlatOptions } from '../common/TRawOptions';
import { eslintFixBatch } from '../common/utils/eslintFix';
import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { resolveHelper } from '../common/utils/pathHelpers';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import { AvatarSwarmGenerator } from './avatarSwarm/AvatarSwarmGenerator';
import { writeSwarmOutput } from './avatarSwarm/writeSwarmOutput';
import { getSpecItemName } from './generationCache/EntitySkip';
import { GenerationCache } from './generationCache/GenerationCache';
import { generateTrafficSplitterModule } from './migration/generateTrafficSplitterModule';
import type { GenerationRootOptions } from './resolveGenerationOptions';
import { ReuseStore } from './reuseStore';
import type { GenerationReport, SpecGenerationStats } from './reuseStore/GenerationReport';
import { writeGenerationReport } from './reuseStore/GenerationReport';
import { SHARED_FOLDER_NAME } from './reuseStore/SharedFolderWriter';
import { finalizeSpecAnalysis, mergeSpecAnalysisConfigAcrossItems, type SpecAnalysisAccumulator } from './specAnalysis/runSpecAnalysis';
import type { SpecAnalysisReport } from './specAnalysis/types';
import { buildWorkspaceReport } from './workspaceReport/buildWorkspaceReport';
import { writeWorkspaceReport } from './workspaceReport/writeWorkspaceReport';
import type { WriteClient } from './write/WriteClient';

export type FinalizeGenerationBatchState = {
    specAnalysisAccumulator: SpecAnalysisAccumulator | null;
    specQualityReport?: SpecAnalysisReport;
    gcMs: number;
    manifestSaveMs: number;
};

export type FinalizeGenerationBatchCtx = {
    writeClient: WriteClient;
    eslintFixOptions: TEslintFixOptions;
    items: TStrictFlatOptions[];
    root: GenerationRootOptions;
    allEntitySkipped: boolean;
    cacheEnabled: boolean;
    cacheStrategy: string;
    generationCaches: Map<string, GenerationCache>;
    reuseStore: ReuseStore | null;
    referencedArtifactKeys: Set<string>;
    specStats: SpecGenerationStats[];
    reportBasePath: string;
    sharedFolderLca?: string;
    buildGenerationReport: () => GenerationReport;
    state: FinalizeGenerationBatchState;
    start: bigint;
};

/**
 * Post-item-loop generation batch finalize (combine → … → ESLint → finished logs).
 */
export async function finalizeGenerationBatch(ctx: FinalizeGenerationBatchCtx): Promise<void> {
    const {
        writeClient,
        eslintFixOptions,
        items,
        root,
        allEntitySkipped,
        cacheEnabled,
        cacheStrategy,
        generationCaches,
        reuseStore,
        referencedArtifactKeys,
        specStats,
        reportBasePath,
        sharedFolderLca,
        buildGenerationReport,
        state,
        start,
    } = ctx;

    if (!allEntitySkipped) {
        if (items[0]?.useSeparatedIndexes) {
            await writeClient.combineAndWrightSimple();
        } else {
            await writeClient.combineAndWrite();
        }
    }

    const trafficSplitterConfig = root.trafficSplitter;
    const trafficSplitterEnabled = trafficSplitterConfig && typeof trafficSplitterConfig === 'object' ? trafficSplitterConfig.enabled : trafficSplitterConfig === true;
    if (trafficSplitterEnabled) {
        if (items.length > 1) {
            writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.TRAFFIC_SPLITTER_MULTI_ITEM_WARN);
        }
        const cfg = typeof trafficSplitterConfig === 'object' ? trafficSplitterConfig : {};
        const firstItemOutput = items[0]?.output ?? '.';
        try {
            await generateTrafficSplitterModule(cfg, firstItemOutput);
        } catch (err: any) {
            writeClient.logger.warn(`trafficSplitter: failed to generate module — ${err.message}`);
        }
    }

    const swarmConfig = root.swarm;
    const swarmEnabled = swarmConfig && typeof swarmConfig === 'object' ? swarmConfig.enabled : swarmConfig === true;
    if (swarmEnabled) {
        const cfg = typeof swarmConfig === 'object' ? swarmConfig : {};
        try {
            const generator = new AvatarSwarmGenerator();
            const manifest = generator.build(items, specStats, reuseStore);
            await writeSwarmOutput(manifest, cfg);
        } catch (err: any) {
            writeClient.logger.warn(`swarm: failed to generate manifest — ${err.message}`);
        }
    }

    await cleanupStaleOutputs(writeClient, items, sharedFolderLca);
    if (cacheEnabled && (cacheStrategy === 'entity' || cacheStrategy === 'reuse')) {
        for (const generationCache of generationCaches.values()) {
            await generationCache.save();
        }
    }
    if (state.specAnalysisAccumulator && !allEntitySkipped) {
        const crossSpecItems = items.map(item => ({
            name: getSpecItemName(item.input),
            input: item.input,
            outputModels: item.outputModels,
            outputSchemas: item.outputSchemas,
        }));
        const mergedSpecAnalysis = mergeSpecAnalysisConfigAcrossItems(
            items.map(item => {
                const resolved = resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection);
                return resolved ? { ...resolved, enabled: resolved.enabled ?? true } : undefined;
            })
        );
        state.specQualityReport = await finalizeSpecAnalysis(state.specAnalysisAccumulator, crossSpecItems, mergedSpecAnalysis, writeClient.logger, reuseStore?.getManifest());
        state.specAnalysisAccumulator = null;
    } else if (state.specAnalysisAccumulator && allEntitySkipped) {
        state.specAnalysisAccumulator = null;
    }

    if (reuseStore) {
        const gcStart = process.hrtime.bigint();
        await reuseStore.gc(referencedArtifactKeys);
        state.gcMs = Number(process.hrtime.bigint() - gcStart) / 1e6;
        if (reuseStore.isDirty()) {
            const saveStart = process.hrtime.bigint();
            await reuseStore.save();
            state.manifestSaveMs = Number(process.hrtime.bigint() - saveStart) / 1e6;
        }
    }

    if (cacheEnabled || state.specQualityReport) {
        await writeGenerationReport(reportBasePath, buildGenerationReport());
    }

    const workspaceReportConfig = root.workspaceReport;
    const workspaceReportEnabled = workspaceReportConfig && typeof workspaceReportConfig === 'object' ? workspaceReportConfig.enabled : workspaceReportConfig === true;
    if (workspaceReportEnabled) {
        const cfg = typeof workspaceReportConfig === 'object' ? workspaceReportConfig : {};
        try {
            const report = buildWorkspaceReport(specStats, reuseStore);
            await writeWorkspaceReport(report, cfg);
        } catch (err: any) {
            writeClient.logger.warn(`workspaceReport: failed to write report — ${err.message}`);
        }
    }

    const writeStats = writeClient.getWriteStats();
    writeClient.logger.info(LOGGER_MESSAGES.GENERATION.WRITE_STATS(writeStats.written, writeStats.unchanged));

    if (!allEntitySkipped) {
        await runBatchEslintFixIfEnabled(writeClient, eslintFixOptions);
    } else {
        writeClient.clearLintTargets();
    }

    writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.FINISHED);
    const end = process.hrtime.bigint();
    const durationInSeconds = Number(end - start) / 1e9;
    writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.FINISHED_WITH_DURATION(durationInSeconds.toFixed(3)));
}

function getOutputRoots(items: TStrictFlatOptions[]): string[] {
    const roots = new Set<string>();
    for (const item of items) {
        const outputDirs = [item.output, item.outputCore, item.outputSchemas, item.outputModels, item.outputServices];
        for (const dir of outputDirs) {
            if (dir) {
                roots.add(resolveHelper(process.cwd(), dir));
            }
        }
    }
    return Array.from(roots);
}

async function cleanupStaleOutputs(writeClient: WriteClient, items: TStrictFlatOptions[], sharedFolderLca?: string): Promise<void> {
    const outputRoots = getOutputRoots(items);
    if (sharedFolderLca) {
        outputRoots.push(resolveHelper(sharedFolderLca, SHARED_FOLDER_NAME));
    }
    const expectedFiles = writeClient.getExpectedOutputFiles();

    for (const root of outputRoots) {
        await removeStaleFilesInDirectory(root, expectedFiles);
    }
}

async function removeStaleFilesInDirectory(path: string, expectedFiles: Set<string>): Promise<boolean> {
    const stats = await fsPromises.stat(path).catch(() => null);
    if (!stats) {
        return false;
    }

    if (stats.isFile()) {
        if (!expectedFiles.has(path)) {
            await fileSystemHelpers.rmdir(path);
            return false;
        }
        return true;
    }

    const entries = await fsPromises.readdir(path);
    let hasAnyFile = false;

    for (const entry of entries) {
        const childPath = resolveHelper(path, entry);
        const childHasFiles = await removeStaleFilesInDirectory(childPath, expectedFiles);
        hasAnyFile = hasAnyFile || childHasFiles;
    }

    if (!hasAnyFile) {
        await fileSystemHelpers.rmdir(path);
        return false;
    }

    return true;
}

async function runBatchEslintFixIfEnabled(writeClient: WriteClient, opts: TEslintFixOptions): Promise<void> {
    const hasTsconfig = !!opts.tsconfigPath;
    const hasEslintConfig = !!opts.eslintConfigPath;

    if (!hasTsconfig && !hasEslintConfig) {
        writeClient.clearLintTargets();
        return;
    }

    if (!hasTsconfig || !hasEslintConfig) {
        writeClient.logger.warn(LOGGER_MESSAGES.FORMATTING.ESLINT_PATHS_MISSING);
        writeClient.clearLintTargets();
        return;
    }

    try {
        const { files, includeGlobs } = writeClient.getLintTargets();
        if (files.length === 0) {
            return;
        }

        const fixStart = process.hrtime.bigint();
        writeClient.logger.forceInfo(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_STARTED);

        await eslintFixBatch({
            files,
            includeGlobs,
            tsconfigPath: opts.tsconfigPath!,
            eslintConfigPath: opts.eslintConfigPath!,
        });

        const fixEnd = process.hrtime.bigint();
        const durationInSeconds = Number(fixEnd - fixStart) / 1e9;
        writeClient.logger.forceInfo(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_FINISHED(durationInSeconds.toFixed(3)));
    } finally {
        writeClient.clearLintTargets();
    }
}
