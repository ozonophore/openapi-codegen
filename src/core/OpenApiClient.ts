import { promises as fsPromises } from 'fs';
import { basename, extname } from 'path';

import { COMMON_DEFAULT_OPTIONS_VALUES, DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../common/Consts';
import { Logger } from '../common/Logger';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import { extractEslintFixOptions, TEslintFixOptions } from '../common/TEslintFixOptions';
import { TFlatOptions, TRawOptions, TStrictFlatOptions } from '../common/TRawOptions';
import { eslintFixBatch } from '../common/utils/eslintFix';
import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { resolveHelper } from '../common/utils/pathHelpers';
import { normalizeMarauderBoolean } from '../common/VersionedSchema/Utils/createBooleanToObjectSchema';
import { mergeMarauderBlockDeep } from '../common/VersionedSchema/Utils/mergeMarauderBlock';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import { Parser as ParserV2 } from './api/v2/Parser';
import { OpenApi as OpenApiV2 } from './api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from './api/v3/Parser';
import { OpenApi as OpenApiV3 } from './api/v3/types/OpenApi.model';
import { AvatarSwarmGenerator } from './avatarSwarm/AvatarSwarmGenerator';
import { writeSwarmOutput } from './avatarSwarm/writeSwarmOutput';
import { Context } from './Context';
import { loadGovernanceConfig } from './governance/loadGovernanceConfig';
import { generateTrafficSplitterModule } from './migration/generateTrafficSplitterModule';
import { loadGeneratorPlugins } from './plugins/loadGeneratorPlugins';
import { buildModelSchemaMap, ReuseStore } from './reuseStore';
import { buildOptionsSlice } from './reuseStore/ArtifactFingerprinter';
import type { GenerationReport, ReuseConflictRecord, SpecGenerationStats } from './reuseStore/GenerationReport';
import { analyzeCrossSpecManifest, writeGenerationReport } from './reuseStore/GenerationReport';
import { resolveOutputGroups } from './reuseStore/OutputGroupResolver';
import { SharedFolderWriter } from './reuseStore/SharedFolderWriter';
import { SHARED_FOLDER_NAME } from './reuseStore/SharedFolderWriter';
import { ReuseConflictError } from './reuseStore/types';
import { runPreAnalyze } from './specAnalysis/runPreAnalyze';
import { createSpecAnalysisAccumulator, finalizeSpecAnalysis, mergeSpecAnalysisConfigAcrossItems, runSpecAnalysis, type SpecAnalysisAccumulator } from './specAnalysis/runSpecAnalysis';
import type { SpecAnalysisReport } from './specAnalysis/types';
import { validateOpenApiStrict, validateWithSwaggerParser, writeOpenApiStrictReport } from './strict/validateOpenApiStrict';
import { OutputPaths } from './types/base/OutputPaths.model';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { ModelsLayout } from './types/enums/ModelsLayout.enum';
import { ModelsMode } from './types/enums/ModelsMode.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
import { applyDiffReportToClient } from './utils/applyDiffReportToClient';
import { GenerationCache } from './utils/GenerationCache';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { getOutputPaths } from './utils/getOutputPaths';
import { DiffReport, loadDiffReport } from './utils/loadDiffReport';
import { isClassesBundleLayout } from './utils/modelsLayoutHelpers';
import { postProcessClient } from './utils/postProcessClient';
import { prepareDtoModels } from './utils/prepareDtoModels';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { resolveClassesModeTypes } from './utils/resolveClassesModeTypes';
import { buildWorkspaceReport } from './workspaceReport/buildWorkspaceReport';
import { writeWorkspaceReport } from './workspaceReport/writeWorkspaceReport';
import { WriteClient } from './WriteClient';

/**
 * Оркестратор генерации OpenAPI-клиента: парсинг спецификации, применение diff-отчёта и запись артефактов.
 */
export class OpenApiClient {
    private static readonly CACHE_FINGERPRINT_VERSION = 1;
    private static readonly DEFAULT_CACHE_FILENAME = '.openapi-codegen-cache.json';
    private _writeClient: WriteClient | null = null;
    private specAnalysisAccumulator: SpecAnalysisAccumulator | null = null;
    /** ESLint paths from top-level rawOptions (not per items[] entry). */
    private eslintFixOptions: TEslintFixOptions = {};

    /** Экземпляр WriteClient для записи сгенерированных файлов. */
    public get writeClient() {
        if (!this._writeClient) {
            throw new Error('WriteClient must be initialized');
        }
        return this._writeClient;
    }

    private mergeItemMarauderBlock<T extends Record<string, unknown>>(root: T | boolean | undefined, item: T | boolean | undefined): T | undefined {
        if (item === undefined) {
            return normalizeMarauderBoolean(root);
        }
        if (root === undefined) {
            return normalizeMarauderBoolean(item);
        }

        return mergeMarauderBlockDeep(normalizeMarauderBoolean(root), normalizeMarauderBoolean(item)) as T;
    }

    private normalizeOptions(rawOptions: TRawOptions): TFlatOptions[] {
        const modelsMode = rawOptions.modelsMode ?? rawOptions.models?.mode;
        const modelsLayout = rawOptions.modelsLayout ?? rawOptions.models?.layout;
        const useHistory = rawOptions.useHistory ?? rawOptions.analyze?.useHistory;
        const diffReport = rawOptions.diffReport ?? rawOptions.analyze?.reportPath;
        const rootMiracles = rawOptions.miracles;
        if (rawOptions.items && rawOptions.items.length > 0) {
            // Для items: Наследуем глобальный request, если не переопределён
            return rawOptions.items.map(item => ({
                ...item,
                httpClient: rawOptions.httpClient,
                autoSelect: normalizeMarauderBoolean(rawOptions.autoSelect),
                specAnalysis: this.mergeItemMarauderBlock(rawOptions.specAnalysis, (item as TFlatOptions).specAnalysis),
                anomalyDetection: this.mergeItemMarauderBlock(rawOptions.anomalyDetection, (item as TFlatOptions).anomalyDetection),
                request: item.request ?? rawOptions.request, // ?? для fallback на глобальный
                plugins: item.plugins ?? rawOptions.plugins,
                customExecutorPath: rawOptions.customExecutorPath,
                useOptions: rawOptions.useOptions,
                useUnionTypes: rawOptions.useUnionTypes,
                includeSchemasFiles: rawOptions.includeSchemasFiles,
                excludeCoreServiceFiles: rawOptions.excludeCoreServiceFiles,
                interfacePrefix: rawOptions.interfacePrefix,
                enumPrefix: rawOptions.enumPrefix,
                typePrefix: rawOptions.typePrefix,
                useCancelableRequest: rawOptions.useCancelableRequest,
                logLevel: rawOptions.logLevel,
                logTarget: rawOptions.logTarget,
                sortByRequired: rawOptions.sortByRequired,
                useSeparatedIndexes: rawOptions.useSeparatedIndexes,
                validationLibrary: rawOptions.validationLibrary,
                emptySchemaStrategy: rawOptions.emptySchemaStrategy,
                useHistory: item.useHistory ?? useHistory,
                diffReport: item.diffReport ?? diffReport,
                modelsMode: item.modelsMode ?? modelsMode,
                modelsLayout: item.modelsLayout ?? modelsLayout,
                miracles: (item as TFlatOptions).miracles ?? rootMiracles,
                strictOpenapi: rawOptions.strictOpenapi,
                reportFile: rawOptions.reportFile,
                failOnGovernanceErrors: rawOptions.failOnGovernanceErrors,
                governanceConfig: rawOptions.governanceConfig,
                cache: rawOptions.cache,
                cachePath: rawOptions.cachePath,
                cacheStrategy: rawOptions.cacheStrategy,
                cacheDebug: rawOptions.cacheDebug,
                reuseOnConflict: rawOptions.reuseOnConflict,
                prettierConfigPath: rawOptions.prettierConfigPath,
            }));
        } else {
            // Плоский формат (из CLI или старого конфига): Один item с глобальным request
            return [
                {
                    input: rawOptions.input ?? '',
                    output: rawOptions.output ?? '',
                    outputCore: rawOptions.outputCore,
                    outputServices: rawOptions.outputServices,
                    outputModels: rawOptions.outputModels,
                    outputSchemas: rawOptions.outputSchemas,
                    httpClient: rawOptions.httpClient,
                    autoSelect: normalizeMarauderBoolean(rawOptions.autoSelect),
                    specAnalysis: normalizeMarauderBoolean(rawOptions.specAnalysis),
                    anomalyDetection: normalizeMarauderBoolean(rawOptions.anomalyDetection),
                    useOptions: rawOptions.useOptions,
                    useUnionTypes: rawOptions.useUnionTypes,
                    includeSchemasFiles: rawOptions.includeSchemasFiles,
                    excludeCoreServiceFiles: rawOptions.excludeCoreServiceFiles,
                    request: rawOptions.request,
                    plugins: rawOptions.plugins,
                    customExecutorPath: rawOptions.customExecutorPath,
                    interfacePrefix: rawOptions.interfacePrefix,
                    enumPrefix: rawOptions.enumPrefix,
                    typePrefix: rawOptions.typePrefix,
                    useCancelableRequest: rawOptions.useCancelableRequest,
                    logLevel: rawOptions.logLevel,
                    logTarget: rawOptions.logTarget,
                    sortByRequired: rawOptions.sortByRequired,
                    useSeparatedIndexes: rawOptions.useSeparatedIndexes,
                    validationLibrary: rawOptions.validationLibrary,
                    emptySchemaStrategy: rawOptions.emptySchemaStrategy,
                    useHistory,
                    diffReport,
                    modelsMode,
                    modelsLayout,
                    miracles: rootMiracles,
                    models: rawOptions.models,
                    strictOpenapi: rawOptions.strictOpenapi,
                    reportFile: rawOptions.reportFile,
                    failOnGovernanceErrors: rawOptions.failOnGovernanceErrors,
                    governanceConfig: rawOptions.governanceConfig,
                    cache: rawOptions.cache,
                    cachePath: rawOptions.cachePath,
                    cacheStrategy: rawOptions.cacheStrategy,
                    cacheDebug: rawOptions.cacheDebug,
                    reuseOnConflict: rawOptions.reuseOnConflict,
                    prettierConfigPath: rawOptions.prettierConfigPath,
                },
            ];
        }
    }

    private addDefaultValues(item: TFlatOptions): TStrictFlatOptions {
        return {
            input: item.input || COMMON_DEFAULT_OPTIONS_VALUES.input,
            output: item.output || COMMON_DEFAULT_OPTIONS_VALUES.output,
            outputCore: item.outputCore || COMMON_DEFAULT_OPTIONS_VALUES.outputCore,
            outputServices: item.outputServices || COMMON_DEFAULT_OPTIONS_VALUES.outputServices,
            outputModels: item.outputModels || COMMON_DEFAULT_OPTIONS_VALUES.outputModels,
            outputSchemas: item.outputSchemas || COMMON_DEFAULT_OPTIONS_VALUES.outputSchemas,
            httpClient: item.httpClient || COMMON_DEFAULT_OPTIONS_VALUES.httpClient,
            useOptions: item.useOptions ?? COMMON_DEFAULT_OPTIONS_VALUES.useOptions,
            useUnionTypes: item.useUnionTypes ?? COMMON_DEFAULT_OPTIONS_VALUES.useUnionTypes,
            includeSchemasFiles: item.includeSchemasFiles ?? COMMON_DEFAULT_OPTIONS_VALUES.includeSchemasFiles,
            excludeCoreServiceFiles: item.excludeCoreServiceFiles ?? COMMON_DEFAULT_OPTIONS_VALUES.excludeCoreServiceFiles,
            request: item.request || COMMON_DEFAULT_OPTIONS_VALUES.request,
            plugins: item.plugins || COMMON_DEFAULT_OPTIONS_VALUES.plugins,
            customExecutorPath: item.customExecutorPath || COMMON_DEFAULT_OPTIONS_VALUES.customExecutorPath,
            interfacePrefix: item.interfacePrefix || COMMON_DEFAULT_OPTIONS_VALUES.interfacePrefix,
            enumPrefix: item.enumPrefix || COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix,
            typePrefix: item.typePrefix || COMMON_DEFAULT_OPTIONS_VALUES.typePrefix,
            useCancelableRequest: item.useCancelableRequest ?? COMMON_DEFAULT_OPTIONS_VALUES.useCancelableRequest,
            logLevel: item.logLevel || COMMON_DEFAULT_OPTIONS_VALUES.logLevel,
            logTarget: item.logTarget || COMMON_DEFAULT_OPTIONS_VALUES.logTarget,
            sortByRequired: item.sortByRequired ?? COMMON_DEFAULT_OPTIONS_VALUES.sortByRequired,
            useSeparatedIndexes: item.useSeparatedIndexes ?? COMMON_DEFAULT_OPTIONS_VALUES.useSeparatedIndexes,
            validationLibrary: item.validationLibrary ?? COMMON_DEFAULT_OPTIONS_VALUES.validationLibrary,
            emptySchemaStrategy: item.emptySchemaStrategy ?? COMMON_DEFAULT_OPTIONS_VALUES.emptySchemaStrategy,
            useHistory: item.useHistory ?? COMMON_DEFAULT_OPTIONS_VALUES.useHistory,
            diffReport: item.diffReport || COMMON_DEFAULT_OPTIONS_VALUES.diffReport,
            modelsMode: item.modelsMode ?? COMMON_DEFAULT_OPTIONS_VALUES.modelsMode,
            modelsLayout: item.modelsLayout ?? item.models?.layout ?? COMMON_DEFAULT_OPTIONS_VALUES.modelsLayout,
            models: item.models || COMMON_DEFAULT_OPTIONS_VALUES.models,
            analyze: item.analyze || COMMON_DEFAULT_OPTIONS_VALUES.analyze,
            miracles: item.miracles || COMMON_DEFAULT_OPTIONS_VALUES.miracles,
            strictOpenapi: item.strictOpenapi ?? COMMON_DEFAULT_OPTIONS_VALUES.strictOpenapi,
            reportFile: item.reportFile || COMMON_DEFAULT_OPTIONS_VALUES.reportFile,
            failOnGovernanceErrors: item.failOnGovernanceErrors ?? COMMON_DEFAULT_OPTIONS_VALUES.failOnGovernanceErrors,
            prettierConfigPath: item.prettierConfigPath ?? COMMON_DEFAULT_OPTIONS_VALUES.prettierConfigPath,
            governanceConfig: item.governanceConfig || COMMON_DEFAULT_OPTIONS_VALUES.governanceConfig,
            cache: item.cache ?? COMMON_DEFAULT_OPTIONS_VALUES.cache,
            cachePath: item.cachePath || COMMON_DEFAULT_OPTIONS_VALUES.cachePath,
            cacheStrategy: item.cacheStrategy ?? COMMON_DEFAULT_OPTIONS_VALUES.cacheStrategy,
            cacheDebug: item.cacheDebug ?? COMMON_DEFAULT_OPTIONS_VALUES.cacheDebug,
            reuseOnConflict: item.reuseOnConflict ?? COMMON_DEFAULT_OPTIONS_VALUES.reuseOnConflict,
            autoSelect: item.autoSelect ?? COMMON_DEFAULT_OPTIONS_VALUES.autoSelect,
            specAnalysis: resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection) ?? COMMON_DEFAULT_OPTIONS_VALUES.specAnalysis,
            anomalyDetection: item.anomalyDetection ?? COMMON_DEFAULT_OPTIONS_VALUES.anomalyDetection,
            workspaceReport: item.workspaceReport ?? COMMON_DEFAULT_OPTIONS_VALUES.workspaceReport,
            trafficSplitter: item.trafficSplitter ?? COMMON_DEFAULT_OPTIONS_VALUES.trafficSplitter,
            swarm: item.swarm ?? COMMON_DEFAULT_OPTIONS_VALUES.swarm,
            preAnalyze: item.preAnalyze ?? COMMON_DEFAULT_OPTIONS_VALUES.preAnalyze,
            reuseMode: item.reuseMode ?? COMMON_DEFAULT_OPTIONS_VALUES.reuseMode,
        };
    }

    private getOutputRoots(items: TStrictFlatOptions[]): string[] {
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

    private async cleanupStaleOutputs(items: TStrictFlatOptions[], sharedFolderLca?: string): Promise<void> {
        const outputRoots = this.getOutputRoots(items);
        if (sharedFolderLca) {
            outputRoots.push(resolveHelper(sharedFolderLca, SHARED_FOLDER_NAME));
        }
        const expectedFiles = this.writeClient.getExpectedOutputFiles();

        for (const root of outputRoots) {
            await this.removeStaleFilesInDirectory(root, expectedFiles);
        }
    }

    private async removeStaleFilesInDirectory(path: string, expectedFiles: Set<string>): Promise<boolean> {
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
            const childHasFiles = await this.removeStaleFilesInDirectory(childPath, expectedFiles);
            hasAnyFile = hasAnyFile || childHasFiles;
        }

        if (!hasAnyFile) {
            await fileSystemHelpers.rmdir(path);
            return false;
        }

        return true;
    }

    private async generateCodeForItems(items: TStrictFlatOptions[], rawOptions: TRawOptions): Promise<void> {
        if (items.length === 0) {
            throw new Error(LOGGER_MESSAGES.GENERATION.NO_OPTIONS);
        }
        this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.STARTED(items.length));

        try {
            const start = process.hrtime.bigint();
            this.validateConsistentCacheSettings(items);
            const cacheEnabled = items[0]?.cache === true;
            const cacheStrategy = items[0]?.cacheStrategy ?? COMMON_DEFAULT_OPTIONS_VALUES.cacheStrategy;
            const useReuseStore = cacheEnabled && cacheStrategy === 'reuse';
            const needsEntityCacheFallback = cacheEnabled && items.some(item => isClassesBundleLayout(item.modelsMode, item.modelsLayout));
            const generationCaches = new Map<string, GenerationCache>();
            let reuseStore: ReuseStore | null = null;
            const referencedArtifactKeys = new Set<string>();
            const specStats: SpecGenerationStats[] = [];
            const reuseConflicts: ReuseConflictRecord[] = [];
            let totalReuseHits = 0;
            let totalReuseMisses = 0;
            let specQualityReport: SpecAnalysisReport | undefined;
            let reportBasePath = this.resolveOutputRoot(items[0]!.output);
            let manifestLoadMs = 0;
            let manifestSaveMs = 0;
            let gcMs = 0;

            const reuseMode = rawOptions.reuseMode ?? 'copy';
            if (reuseMode === 'auto-group' && cacheStrategy !== 'reuse') {
                this.writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.AUTO_GROUP_REQUIRES_REUSE_CACHE);
            }

            let sharedFolderWriter: SharedFolderWriter | null = null;
            if (reuseMode === 'auto-group' && useReuseStore) {
                const absoluteOutputPaths = items.map(item => this.resolveOutputRoot(item.output));
                const lca = resolveOutputGroups(absoluteOutputPaths);
                if (lca) {
                    sharedFolderWriter = new SharedFolderWriter(this.writeClient, lca);
                } else {
                    this.writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.AUTO_GROUP_LCA_TRIVIAL_FALLBACK);
                }
            }

            if (items.some(item => resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection)?.enabled)) {
                this.specAnalysisAccumulator = createSpecAnalysisAccumulator();
            }

            if (!cacheEnabled) {
                this.warnOnSharedOutputs(items);
            } else if (useReuseStore) {
                this.warnOnSharedCoreServiceOutputs(items, !!sharedFolderWriter);
                reuseStore = new ReuseStore(this.resolveReuseStorePath(items[0]!.cachePath));
                const loadStart = process.hrtime.bigint();
                await reuseStore.load();
                manifestLoadMs = Number(process.hrtime.bigint() - loadStart) / 1e6;
                reportBasePath = reuseStore.getRootPath();
                if (items.some(item => isClassesBundleLayout(item.modelsMode, item.modelsLayout))) {
                    this.writeClient.logger.warn('ReuseStore is disabled for modelsMode=classes with layout=bundle; falling back to entity cache for those items');
                }
            }

            if (cacheEnabled && (cacheStrategy === 'entity' || needsEntityCacheFallback)) {
                for (const outputRoot of this.getUniqueResolvedOutputs(items)) {
                    const sampleItem = items.find(item => this.resolveOutputRoot(item.output) === outputRoot);
                    if (!sampleItem) {
                        continue;
                    }
                    const cachePath = this.resolveCachePathForOutput(sampleItem.output, sampleItem.cachePath);
                    const generationCache = new GenerationCache(cachePath);
                    await generationCache.load();
                    generationCaches.set(outputRoot, generationCache);
                }
            } else if (cacheEnabled && cacheStrategy === 'content' && items[0]?.cacheDebug) {
                this.writeClient.logger.info('cacheStrategy: content — relying on writeFileIfChanged only');
            }

            const buildGenerationReport = (): GenerationReport => {
                const report: GenerationReport = {
                    generatedAt: new Date().toISOString(),
                    generatorVersion: process.env.npm_package_version || 'dev',
                    specs: specStats,
                    reuse: {
                        totalHits: totalReuseHits,
                        totalMisses: totalReuseMisses,
                        conflicts: reuseConflicts,
                    },
                };

                if (reuseStore && items.some(item => resolveSpecAnalysisConfig(item.specAnalysis, item.anomalyDetection)?.crossSpec !== false)) {
                    report.crossSpec = analyzeCrossSpecManifest(reuseStore.getManifest());
                }

                if (specQualityReport) {
                    report.specQuality = {
                        ...specQualityReport,
                        failOnHighTriggered: specQualityReport.summary.high > 0,
                    };
                }

                if (items[0]?.cacheDebug && reuseStore) {
                    report.phases = { manifestLoadMs, manifestSaveMs, gcMs };
                }

                return report;
            };

            if (rawOptions.preAnalyze === true) {
                await runPreAnalyze(items, this.writeClient.logger);
            }

            for (const option of items) {
                const fileStart = process.hrtime.bigint();
                const generationCache =
                    cacheEnabled && (cacheStrategy === 'entity' || (cacheStrategy === 'reuse' && isClassesBundleLayout(option.modelsMode, option.modelsLayout)))
                        ? (generationCaches.get(this.resolveOutputRoot(option.output)) ?? null)
                        : null;
                let reuseHits = 0;
                let reuseMisses = 0;

                try {
                    await this.generateSingle(option, generationCache, {
                        reuseStore: useReuseStore ? reuseStore : null,
                        referencedArtifactKeys,
                        sharedFolderWriter: sharedFolderWriter ?? undefined,
                        onReuseStat: hit => {
                            if (hit) {
                                reuseHits += 1;
                                totalReuseHits += 1;
                            } else {
                                reuseMisses += 1;
                                totalReuseMisses += 1;
                            }
                        },
                    });
                } catch (error) {
                    if (error instanceof ReuseConflictError) {
                        reuseConflicts.push({
                            ...error.details,
                            timestamp: new Date().toISOString(),
                        });
                        if (cacheEnabled || this.specAnalysisAccumulator) {
                            await writeGenerationReport(reportBasePath, buildGenerationReport());
                        }
                    }
                    throw error;
                }

                const fileEnd = process.hrtime.bigint();
                const fileDurationInSeconds = Number(fileEnd - fileStart) / 1e9;
                specStats.push({
                    specItem: this.getSpecItemName(option.input),
                    input: option.input,
                    durationMs: Math.round(fileDurationInSeconds * 1000),
                    reuseHits,
                    reuseMisses,
                });
                this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.DURATION_FOR_FILE(option.input, fileDurationInSeconds.toFixed(3)));
            }
            if (items[0]?.useSeparatedIndexes) {
                await this.writeClient.combineAndWrightSimple();
            } else {
                await this.writeClient.combineAndWrite();
            }

            const trafficSplitterConfig = rawOptions.trafficSplitter;
            const trafficSplitterEnabled = trafficSplitterConfig && typeof trafficSplitterConfig === 'object' ? trafficSplitterConfig.enabled : trafficSplitterConfig === true;
            if (trafficSplitterEnabled) {
                if (items.length > 1) {
                    this.writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.TRAFFIC_SPLITTER_MULTI_ITEM_WARN);
                }
                const cfg = typeof trafficSplitterConfig === 'object' ? trafficSplitterConfig : {};
                const firstItemOutput = items[0]?.output ?? '.';
                try {
                    await generateTrafficSplitterModule(cfg, firstItemOutput);
                } catch (err: any) {
                    this.writeClient.logger.warn(`trafficSplitter: failed to generate module — ${err.message}`);
                }
            }

            const swarmConfig = rawOptions.swarm;
            const swarmEnabled = swarmConfig && typeof swarmConfig === 'object' ? swarmConfig.enabled : swarmConfig === true;
            if (swarmEnabled) {
                const cfg = typeof swarmConfig === 'object' ? swarmConfig : {};
                try {
                    const generator = new AvatarSwarmGenerator();
                    const manifest = generator.build(items, specStats, reuseStore);
                    await writeSwarmOutput(manifest, cfg);
                } catch (err: any) {
                    this.writeClient.logger.warn(`swarm: failed to generate manifest — ${err.message}`);
                }
            }

            await this.cleanupStaleOutputs(items, sharedFolderWriter?.lca);
            if (cacheEnabled && (cacheStrategy === 'entity' || needsEntityCacheFallback)) {
                for (const generationCache of generationCaches.values()) {
                    await generationCache.save();
                }
            }
            if (this.specAnalysisAccumulator) {
                const crossSpecItems = items.map(item => ({
                    name: this.getSpecItemName(item.input),
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
                specQualityReport = await finalizeSpecAnalysis(this.specAnalysisAccumulator, crossSpecItems, mergedSpecAnalysis, this.writeClient.logger, reuseStore?.getManifest());
                this.specAnalysisAccumulator = null;
            }

            if (cacheEnabled || specQualityReport) {
                await writeGenerationReport(reportBasePath, buildGenerationReport());
            }

            const workspaceReportConfig = rawOptions.workspaceReport;
            const workspaceReportEnabled = workspaceReportConfig && typeof workspaceReportConfig === 'object' ? workspaceReportConfig.enabled : workspaceReportConfig === true;
            if (workspaceReportEnabled) {
                const cfg = typeof workspaceReportConfig === 'object' ? workspaceReportConfig : {};
                try {
                    const report = buildWorkspaceReport(specStats, reuseStore);
                    await writeWorkspaceReport(report, cfg);
                } catch (err: any) {
                    this.writeClient.logger.warn(`workspaceReport: failed to write report — ${err.message}`);
                }
            }

            if (reuseStore) {
                const gcStart = process.hrtime.bigint();
                await reuseStore.gc(referencedArtifactKeys);
                gcMs = Number(process.hrtime.bigint() - gcStart) / 1e6;
                if (reuseStore.isDirty()) {
                    const saveStart = process.hrtime.bigint();
                    await reuseStore.save();
                    manifestSaveMs = Number(process.hrtime.bigint() - saveStart) / 1e6;
                }
            }
            const writeStats = this.writeClient.getWriteStats();
            this.writeClient.logger.info(LOGGER_MESSAGES.GENERATION.WRITE_STATS(writeStats.written, writeStats.unchanged));

            await this.runBatchEslintFixIfEnabled();

            this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.FINISHED);
            const end = process.hrtime.bigint();
            const durationInSeconds = Number(end - start) / 1e9;
            this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.FINISHED_WITH_DURATION(durationInSeconds.toFixed(3)));
        } catch (error: any) {
            this.writeClient.logger.error(LOGGER_MESSAGES.ERROR.GENERIC(error.message));
            throw error;
        }

        this.writeClient.logger.shutdownLogger();
    }

    private getUniqueResolvedOutputs(items: TStrictFlatOptions[]): string[] {
        return Array.from(new Set(items.map(item => this.resolveOutputRoot(item.output))));
    }

    private resolveOutputRoot(output: string): string {
        return resolveHelper(process.cwd(), output);
    }

    private resolveReuseStorePath(cachePath: string): string {
        if (cachePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(cachePath)) {
            return cachePath;
        }
        return resolveHelper(process.cwd(), cachePath || '.openapi-codegen-store');
    }

    private getSpecItemName(input: string): string {
        const absoluteInput = resolveHelper(process.cwd(), input);
        return basename(absoluteInput, extname(absoluteInput));
    }

    private resolveCachePathForOutput(output: string, cachePath: string): string {
        if (cachePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(cachePath)) {
            return cachePath;
        }
        return resolveHelper(this.resolveOutputRoot(output), cachePath || OpenApiClient.DEFAULT_CACHE_FILENAME);
    }

    private validateConsistentCacheSettings(items: TStrictFlatOptions[]): void {
        if (items.length <= 1) {
            return;
        }

        const first = items[0]!;
        for (const item of items.slice(1)) {
            if (item.modelsMode !== first.modelsMode) {
                this.writeClient.logger.warn(
                    `modelsMode differs between "${first.input}" (${first.modelsMode}) and "${item.input}" (${item.modelsMode}). ` +
                        `This may cause unexpected cache behavior when cacheStrategy is "reuse".`
                );
            }
        }
    }

    private warnOnSharedOutputs(items: TStrictFlatOptions[]): void {
        const countByOutput = new Map<string, number>();
        for (const item of items) {
            const output = this.resolveOutputRoot(item.output);
            countByOutput.set(output, (countByOutput.get(output) ?? 0) + 1);
        }
        const duplicatedOutputs = Array.from(countByOutput.entries())
            .filter(([, count]) => count > 1)
            .map(([output]) => output);

        if (duplicatedOutputs.length === 0) {
            return;
        }

        this.writeClient.logger.warn(LOGGER_MESSAGES.GENERATION.CACHE_SHARED_OUTPUT_WARNING(duplicatedOutputs.map(output => `- ${output}`).join('\n')));
    }

    private warnOnSharedCoreServiceOutputs(items: TStrictFlatOptions[], sharedCoreActive = false): void {
        const countByPath = new Map<string, Set<string>>();
        for (const item of items) {
            const paths = getOutputPaths({
                output: item.output,
                outputCore: item.outputCore,
                outputServices: item.outputServices,
                outputModels: item.outputModels,
                outputSchemas: item.outputSchemas,
            });
            for (const pathKey of ['outputCore' as const, 'outputServices' as const]) {
                const resolved = paths[pathKey];
                if (!countByPath.has(resolved)) {
                    countByPath.set(resolved, new Set());
                }
                countByPath.get(resolved)!.add(this.getSpecItemName(item.input));
            }
        }

        const collisions = Array.from(countByPath.entries()).filter(([, specs]) => specs.size > 1);
        if (collisions.length === 0) {
            return;
        }

        const details = collisions.map(([path, specs]) => `- ${path}: ${Array.from(specs).join(', ')}`).join('\n');
        this.writeClient.logger.warn(
            sharedCoreActive ? LOGGER_MESSAGES.GENERATION.SHARED_CORE_SERVICES_PATH_COLLISION(details) : LOGGER_MESSAGES.GENERATION.SHARED_CORE_SERVICES_PATH_COLLISION_MODELS_ONLY(details)
        );
    }

    private warnOnSharedOutputsWithoutCache(items: TStrictFlatOptions[]): void {
        this.warnOnSharedOutputs(items);
    }

    private async generateSingle(
        item: TStrictFlatOptions,
        generationCache: GenerationCache | null,
        reuseContext?: {
            reuseStore: ReuseStore | null;
            referencedArtifactKeys: Set<string>;
            onReuseStat?: (hit: boolean) => void;
            sharedFolderWriter?: SharedFolderWriter;
        }
    ): Promise<void> {
        const {
            input,
            output,
            outputCore,
            outputServices,
            outputModels,
            outputSchemas,
            httpClient,
            useOptions,
            useUnionTypes,
            excludeCoreServiceFiles,
            request,
            plugins,
            customExecutorPath,
            interfacePrefix,
            enumPrefix,
            typePrefix,
            useCancelableRequest,
            sortByRequired,
            useSeparatedIndexes,
            validationLibrary = ValidationLibrary.NONE,
            emptySchemaStrategy = EmptySchemaStrategy.KEEP,
            useHistory,
            diffReport,
            modelsMode = ModelsMode.INTERFACES,
            modelsLayout = ModelsLayout.BUNDLE,
            miracles,
            strictOpenapi,
            reportFile,
            failOnGovernanceErrors,
            prettierConfigPath,
            governanceConfig,
            specAnalysis,
        } = item;
        const outputPaths: OutputPaths = getOutputPaths({
            output,
            outputCore,
            outputServices,
            outputModels,
            outputSchemas,
        });
        const absoluteInput = resolveHelper(process.cwd(), input);
        const cacheKey = this.getCacheKey(item, absoluteInput);
        const useEntityCache =
            item.cache && generationCache !== null && (item.cacheStrategy === 'entity' || (item.cacheStrategy === 'reuse' && isClassesBundleLayout(item.modelsMode, item.modelsLayout)));
        const useReuseStore = item.cache && item.cacheStrategy === 'reuse' && reuseContext?.reuseStore != null && !isClassesBundleLayout(item.modelsMode, item.modelsLayout);
        const cacheFingerprint = useEntityCache ? await this.getCacheFingerprint(item, absoluteInput) : '';
        const specInput = this.getSpecItemName(item.input);
        const optionsSlice = buildOptionsSlice(item);
        if (useEntityCache) {
            const cachedEntry = generationCache!.get(cacheKey);
            if (cachedEntry && cachedEntry.fingerprint === cacheFingerprint) {
                const allFilesExist = await this.filesExist(cachedEntry.files);
                if (allFilesExist) {
                    for (const filePath of cachedEntry.files) {
                        this.writeClient.registerOutputFile(filePath);
                    }
                    if (item.cacheDebug) {
                        this.writeClient.logger.info(LOGGER_MESSAGES.GENERATION.CACHE_HIT(input));
                    }
                    return;
                }
            }
            if (item.cacheDebug) {
                this.writeClient.logger.info(LOGGER_MESSAGES.GENERATION.CACHE_MISS(input));
            }
        }
        const knownFilesBefore = new Set(this.writeClient.getExpectedOutputFilesArray());
        const generatorPlugins = await loadGeneratorPlugins(plugins);
        const context = new Context({
            input: absoluteInput,
            output: outputPaths,
            prefix: { interface: interfacePrefix, enum: enumPrefix, type: typePrefix },
            sortByRequired,
            plugins: generatorPlugins,
        });
        const openApi = await getOpenApiSpec(context, absoluteInput);

        if (specAnalysis?.enabled) {
            await runSpecAnalysis(openApi, { ...specAnalysis, enabled: true }, this.writeClient.logger, this.getSpecItemName(input), this.specAnalysisAccumulator ?? undefined, {
                interface: interfacePrefix,
                enum: enumPrefix,
                type: typePrefix,
            });
        }

        if (strictOpenapi) {
            const parserValidationIssues = await validateWithSwaggerParser(absoluteInput);
            const governancePolicy = await loadGovernanceConfig(governanceConfig);
            const strictReport = validateOpenApiStrict({
                openApi,
                context,
                preIssues: parserValidationIssues,
                governanceConfig: governancePolicy,
            });
            const reportPath = await writeOpenApiStrictReport(strictReport, reportFile);
            this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.STRICT_REPORT_CREATED(reportPath));

            if (strictReport.summary.errors > 0) {
                throw new Error(`Strict OpenAPI validation failed with ${strictReport.summary.errors} error(s). Report: ${reportPath}`);
            }

            if (failOnGovernanceErrors && strictReport.governance.summary.errors > 0) {
                throw new Error(`Governance validation failed with ${strictReport.governance.summary.errors} error(s). Report: ${reportPath}`);
            }
        }

        const openApiVersion = getOpenApiVersion(openApi);
        const templates = registerHandlebarTemplates({
            httpClient,
            useUnionTypes,
            useOptions,
            validationLibrary,
            useBatchEslintFix: Boolean(this.eslintFixOptions.tsconfigPath && this.eslintFixOptions.eslintConfigPath),
        });
        const diffReportData = await this.loadDiffReportIfNeeded({
            useHistory,
            diffReport,
            inputPath: absoluteInput,
        });
        if (useHistory && !diffReportData) {
            const reportPath = diffReport || DEFAULT_ANALYZE_DIFF_REPORT_PATH;
            this.writeClient.logger.warn(LOGGER_MESSAGES.DIFF_REPORT.USE_HISTORY_NO_REPORT(reportPath));
        }
        this.writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.DEFINING_VERSION);
        switch (openApiVersion) {
            case OpenApiVersion.V2: {
                const client = new ParserV2(context).parse(openApi as OpenApiV2);
                const clientWithDiff = this.applyDiffReportIfNeeded({
                    client,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    openApi,
                    openApiVersion,
                    diffReport: diffReportData,
                    context,
                    miracles,
                });
                const clientFinal = postProcessClient(clientWithDiff);
                const clientPrepared = modelsMode === ModelsMode.CLASSES ? resolveClassesModeTypes(prepareDtoModels(clientFinal)) : clientFinal;
                const modelSchemas = buildModelSchemaMap(context);
                this.writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V2);
                await this.writeClient.writeClient({
                    client: clientPrepared,
                    templates,
                    outputPaths,
                    httpClient,
                    useOptions,
                    useUnionTypes,
                    excludeCoreServiceFiles,
                    request,
                    customExecutorPath,
                    useCancelableRequest,
                    useSeparatedIndexes,
                    validationLibrary,
                    emptySchemaStrategy,
                    modelsMode,
                    modelsLayout,
                    prettierConfigPath,
                    reuseStore: useReuseStore ? reuseContext!.reuseStore! : undefined,
                    optionsSlice: useReuseStore ? optionsSlice : undefined,
                    specInput: useReuseStore ? specInput : undefined,
                    inputPath: useReuseStore ? absoluteInput : undefined,
                    modelSchemas: useReuseStore ? modelSchemas : undefined,
                    referencedArtifactKeys: useReuseStore ? reuseContext!.referencedArtifactKeys : undefined,
                    onReuseStat: useReuseStore ? reuseContext!.onReuseStat : undefined,
                    reuseOnConflict: useReuseStore ? item.reuseOnConflict : undefined,
                    sharedFolderWriter: useReuseStore ? reuseContext!.sharedFolderWriter : undefined,
                });
                break;
            }

            case OpenApiVersion.V3: {
                const client = new ParserV3(context).parse(openApi as OpenApiV3);
                const clientWithDiff = this.applyDiffReportIfNeeded({
                    client,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    openApi,
                    openApiVersion,
                    diffReport: diffReportData,
                    context,
                    miracles,
                });
                const clientFinal = postProcessClient(clientWithDiff);
                const clientPrepared = modelsMode === ModelsMode.CLASSES ? resolveClassesModeTypes(prepareDtoModels(clientFinal)) : clientFinal;
                const modelSchemas = buildModelSchemaMap(context);
                this.writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V3);
                await this.writeClient.writeClient({
                    client: clientPrepared,
                    templates,
                    outputPaths,
                    httpClient,
                    useOptions,
                    useUnionTypes,
                    excludeCoreServiceFiles,
                    request,
                    customExecutorPath,
                    useCancelableRequest,
                    useSeparatedIndexes,
                    validationLibrary,
                    emptySchemaStrategy,
                    modelsMode,
                    modelsLayout,
                    prettierConfigPath,
                    reuseStore: useReuseStore ? reuseContext!.reuseStore! : undefined,
                    optionsSlice: useReuseStore ? optionsSlice : undefined,
                    specInput: useReuseStore ? specInput : undefined,
                    inputPath: useReuseStore ? absoluteInput : undefined,
                    modelSchemas: useReuseStore ? modelSchemas : undefined,
                    referencedArtifactKeys: useReuseStore ? reuseContext!.referencedArtifactKeys : undefined,
                    onReuseStat: useReuseStore ? reuseContext!.onReuseStat : undefined,
                    reuseOnConflict: useReuseStore ? item.reuseOnConflict : undefined,
                    sharedFolderWriter: useReuseStore ? reuseContext!.sharedFolderWriter : undefined,
                });
                break;
            }
        }
        const generatedFiles = this.writeClient.getExpectedOutputFilesArray().filter(filePath => !knownFilesBefore.has(filePath));
        if (item.cache && generationCache && (item.cacheStrategy === 'entity' || (item.cacheStrategy === 'reuse' && isClassesBundleLayout(item.modelsMode, item.modelsLayout)))) {
            generationCache.set({
                key: cacheKey,
                fingerprint: cacheFingerprint,
                files: generatedFiles,
                updatedAt: Date.now(),
            });
        }
    }

    private getCacheKey(item: TStrictFlatOptions, absoluteInput: string): string {
        return GenerationCache.hash(
            JSON.stringify({
                input: absoluteInput,
                output: item.output,
                outputCore: item.outputCore,
                outputServices: item.outputServices,
                outputModels: item.outputModels,
                outputSchemas: item.outputSchemas,
            })
        );
    }

    private async getCacheFingerprint(item: TStrictFlatOptions, absoluteInput: string): Promise<string> {
        const specContent = await fileSystemHelpers.readFile(absoluteInput, 'utf8');
        const fingerprint = {
            cacheFingerprintVersion: OpenApiClient.CACHE_FINGERPRINT_VERSION,
            generatorVersion: process.env.npm_package_version || 'dev',
            specHash: GenerationCache.hash(specContent),
            options: {
                httpClient: item.httpClient,
                useOptions: item.useOptions,
                useUnionTypes: item.useUnionTypes,
                includeSchemasFiles: item.includeSchemasFiles,
                excludeCoreServiceFiles: item.excludeCoreServiceFiles,
                request: item.request,
                plugins: item.plugins,
                customExecutorPath: item.customExecutorPath,
                interfacePrefix: item.interfacePrefix,
                enumPrefix: item.enumPrefix,
                typePrefix: item.typePrefix,
                useCancelableRequest: item.useCancelableRequest,
                sortByRequired: item.sortByRequired,
                useSeparatedIndexes: item.useSeparatedIndexes,
                validationLibrary: item.validationLibrary,
                emptySchemaStrategy: item.emptySchemaStrategy,
                useHistory: item.useHistory,
                diffReport: item.diffReport,
                modelsMode: item.modelsMode,
                modelsLayout: item.modelsLayout,
                strictOpenapi: item.strictOpenapi,
                failOnGovernanceErrors: item.failOnGovernanceErrors,
            },
        };

        return GenerationCache.hash(JSON.stringify(fingerprint));
    }

    private async filesExist(paths: string[]): Promise<boolean> {
        for (const filePath of paths) {
            const exists = await fileSystemHelpers.exists(filePath);
            if (!exists) {
                return false;
            }
        }
        return true;
    }

    /**
     * Runs batch ESLint fix after combineAndWrite / combineAndWrightSimple when both paths are set.
     * Warns and skips when only one path is provided; always clears the WriteClient lint registry.
     */
    private async runBatchEslintFixIfEnabled(): Promise<void> {
        const opts = this.eslintFixOptions;
        const hasTsconfig = !!opts.tsconfigPath;
        const hasEslintConfig = !!opts.eslintConfigPath;

        if (!hasTsconfig && !hasEslintConfig) {
            this.writeClient.clearLintTargets();
            return;
        }

        if (!hasTsconfig || !hasEslintConfig) {
            this.writeClient.logger.warn(LOGGER_MESSAGES.FORMATTING.ESLINT_PATHS_MISSING);
            this.writeClient.clearLintTargets();
            return;
        }

        try {
            const { files, includeGlobs } = this.writeClient.getLintTargets();
            if (files.length === 0) {
                return;
            }

            const fixStart = process.hrtime.bigint();
            this.writeClient.logger.forceInfo(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_STARTED);

            await eslintFixBatch({
                files,
                includeGlobs,
                tsconfigPath: opts.tsconfigPath!,
                eslintConfigPath: opts.eslintConfigPath!,
            });

            const fixEnd = process.hrtime.bigint();
            const durationInSeconds = Number(fixEnd - fixStart) / 1e9;
            this.writeClient.logger.forceInfo(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_FINISHED(durationInSeconds.toFixed(3)));
        } finally {
            this.writeClient.clearLintTargets();
        }
    }

    private async loadDiffReportIfNeeded(params: { useHistory?: boolean; diffReport?: string; inputPath?: string }): Promise<DiffReport | null> {
        return loadDiffReport({
            useHistory: params.useHistory,
            diffReport: params.diffReport,
            inputPath: params.inputPath,
            logger: this.writeClient.logger,
        });
    }

    private applyDiffReportIfNeeded(params: {
        client: Client;
        openApi: Record<string, unknown>;
        openApiVersion: OpenApiVersion;
        diffReport: DiffReport | null;
        context: Context;
        miracles?: TStrictFlatOptions['miracles'];
    }): Client {
        if (!params.diffReport) {
            return params.client;
        }

        return applyDiffReportToClient({
            client: params.client,
            openApi: params.openApi,
            openApiVersion: params.openApiVersion,
            diffReport: params.diffReport,
            prefix: params.context.prefix,
            context: params.context,
            miraclesConfig: params.miracles,
        });
    }

    /**
     * Запускает генерацию клиента по опциям CLI или конфигурации.
     * @param rawOptions сырые опции генерации
     */
    async generate(rawOptions: TRawOptions) {
        const logger = new Logger({
            level: rawOptions.logLevel ?? COMMON_DEFAULT_OPTIONS_VALUES.logLevel!,
            instanceId: 'client',
            logOutput: rawOptions.logTarget ?? COMMON_DEFAULT_OPTIONS_VALUES.logTarget!,
        });
        this._writeClient = new WriteClient(logger);
        this.eslintFixOptions = extractEslintFixOptions(rawOptions);

        const items = this.normalizeOptions(rawOptions).map(item => this.addDefaultValues(item));
        await this.generateCodeForItems(items, rawOptions);
    }
}
