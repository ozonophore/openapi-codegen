import { promises as fsPromises } from 'fs';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../common/Consts';
import { Logger } from '../common/Logger';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import { extractEslintFixOptions, TEslintFixOptions } from '../common/TEslintFixOptions';
import { TFlatOptions, TRawOptions, TStrictFlatOptions } from '../common/TRawOptions';
import { eslintFixBatch } from '../common/utils/eslintFix';
import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { resolveHelper } from '../common/utils/pathHelpers';
import { Parser as ParserV2 } from './api/v2/Parser';
import { OpenApi as OpenApiV2 } from './api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from './api/v3/Parser';
import { OpenApi as OpenApiV3 } from './api/v3/types/OpenApi.model';
import { Context } from './Context';
import { loadGovernanceConfig } from './governance/loadGovernanceConfig';
import { loadGeneratorPlugins } from './plugins/loadGeneratorPlugins';
import { validateOpenApiStrict, validateWithSwaggerParser, writeOpenApiStrictReport } from './strict/validateOpenApiStrict';
import { OutputPaths } from './types/base/OutputPaths.model';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { ModelsMode } from './types/enums/ModelsMode.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
import { applyDiffReportToClient } from './utils/applyDiffReportToClient';
import { GenerationCache } from './utils/GenerationCache';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { getOutputPaths } from './utils/getOutputPaths';
import { DiffReport, loadDiffReport } from './utils/loadDiffReport';
import { postProcessClient } from './utils/postProcessClient';
import { prepareDtoModels } from './utils/prepareDtoModels';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { WriteClient } from './WriteClient';

export class OpenApiClient {
    private static readonly CACHE_FINGERPRINT_VERSION = 1;
    private static readonly DEFAULT_CACHE_FILENAME = '.openapi-codegen-cache.json';
    private _writeClient: WriteClient | null = null;
    /** ESLint paths from top-level rawOptions (not per items[] entry). */
    private eslintFixOptions: TEslintFixOptions = {};

    public get writeClient() {
        if (!this._writeClient) {
            throw new Error('WriteClient must be initialized');
        }
        return this._writeClient;
    }

    private normalizeOptions(rawOptions: TRawOptions): TFlatOptions[] {
        const modelsMode = rawOptions.modelsMode ?? rawOptions.models?.mode;
        const useHistory = rawOptions.useHistory ?? rawOptions.analyze?.useHistory;
        const diffReport = rawOptions.diffReport ?? rawOptions.analyze?.reportPath;
        if (rawOptions.items && rawOptions.items.length > 0) {
            // Для items: Наследуем глобальный request, если не переопределён
            return rawOptions.items.map(item => ({
                ...item,
                httpClient: rawOptions.httpClient,
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
                strictOpenapi: rawOptions.strictOpenapi,
                reportFile: rawOptions.reportFile,
                governanceConfig: rawOptions.governanceConfig,
                cache: rawOptions.cache,
                cachePath: rawOptions.cachePath,
                cacheStrategy: rawOptions.cacheStrategy,
                cacheDebug: rawOptions.cacheDebug,
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
                    strictOpenapi: rawOptions.strictOpenapi,
                    reportFile: rawOptions.reportFile,
                    governanceConfig: rawOptions.governanceConfig,
                    cache: rawOptions.cache,
                    cachePath: rawOptions.cachePath,
                    cacheStrategy: rawOptions.cacheStrategy,
                    cacheDebug: rawOptions.cacheDebug,
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
            models: item.models || COMMON_DEFAULT_OPTIONS_VALUES.models,
            analyze: item.analyze || COMMON_DEFAULT_OPTIONS_VALUES.analyze,
            miracles: item.miracles || COMMON_DEFAULT_OPTIONS_VALUES.miracles,
            strictOpenapi: item.strictOpenapi ?? COMMON_DEFAULT_OPTIONS_VALUES.strictOpenapi,
            reportFile: item.reportFile || COMMON_DEFAULT_OPTIONS_VALUES.reportFile,
            prettierConfigPath: item.prettierConfigPath ?? COMMON_DEFAULT_OPTIONS_VALUES.prettierConfigPath,
            governanceConfig: item.governanceConfig || COMMON_DEFAULT_OPTIONS_VALUES.governanceConfig,
            cache: item.cache ?? COMMON_DEFAULT_OPTIONS_VALUES.cache,
            cachePath: item.cachePath || COMMON_DEFAULT_OPTIONS_VALUES.cachePath,
            cacheStrategy: item.cacheStrategy ?? COMMON_DEFAULT_OPTIONS_VALUES.cacheStrategy,
            cacheDebug: item.cacheDebug ?? COMMON_DEFAULT_OPTIONS_VALUES.cacheDebug,
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

    private async cleanupStaleOutputs(items: TStrictFlatOptions[]): Promise<void> {
        const outputRoots = this.getOutputRoots(items);
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

    private async generateCodeForItems(items: TStrictFlatOptions[]): Promise<void> {
        if (items.length === 0) {
            throw new Error(LOGGER_MESSAGES.GENERATION.NO_OPTIONS);
        }
        this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.STARTED(items.length));

        try {
            const start = process.hrtime.bigint();
            const cacheEnabled = items[0]?.cache === true;
            const generationCaches = new Map<string, GenerationCache>();

            if (!cacheEnabled) {
                this.warnOnSharedOutputsWithoutCache(items);
            } else {
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
            }

            for (const option of items) {
                const fileStart = process.hrtime.bigint();
                const generationCache = cacheEnabled ? (generationCaches.get(this.resolveOutputRoot(option.output)) ?? null) : null;
                await this.generateSingle(option, generationCache);
                const fileEnd = process.hrtime.bigint();
                const fileDurationInSeconds = Number(fileEnd - fileStart) / 1e9;
                this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.DURATION_FOR_FILE(option.input, fileDurationInSeconds.toFixed(3)));
            }
            if (items[0]?.useSeparatedIndexes) {
                await this.writeClient.combineAndWrightSimple();
            } else {
                await this.writeClient.combineAndWrite();
            }
            await this.cleanupStaleOutputs(items);
            if (cacheEnabled) {
                for (const generationCache of generationCaches.values()) {
                    await generationCache.save();
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

    private resolveCachePathForOutput(output: string, cachePath: string): string {
        if (cachePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(cachePath)) {
            return cachePath;
        }
        return resolveHelper(this.resolveOutputRoot(output), cachePath || OpenApiClient.DEFAULT_CACHE_FILENAME);
    }

    private warnOnSharedOutputsWithoutCache(items: TStrictFlatOptions[]): void {
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

    private async generateSingle(item: TStrictFlatOptions, generationCache: GenerationCache | null): Promise<void> {
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
            strictOpenapi,
            reportFile,
            prettierConfigPath,
            governanceConfig,
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
        const cacheFingerprint = await this.getCacheFingerprint(item, absoluteInput);
        const useEntityCache = item.cache && item.cacheStrategy === 'entity' && generationCache !== null;
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
                });
                const clientFinal = postProcessClient(clientWithDiff);
                const clientPrepared = modelsMode === ModelsMode.CLASSES ? prepareDtoModels(clientFinal) : clientFinal;
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
                    prettierConfigPath,
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
                });
                const clientFinal = postProcessClient(clientWithDiff);
                const clientPrepared = modelsMode === ModelsMode.CLASSES ? prepareDtoModels(clientFinal) : clientFinal;
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
                    prettierConfigPath,
                });
                break;
            }
        }
        const generatedFiles = this.writeClient.getExpectedOutputFilesArray().filter(filePath => !knownFilesBefore.has(filePath));
        if (item.cache && generationCache) {
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
                strictOpenapi: item.strictOpenapi,
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

    private applyDiffReportIfNeeded(params: { client: Client; openApi: Record<string, unknown>; openApiVersion: OpenApiVersion; diffReport: DiffReport | null; context: Context }): Client {
        if (!params.diffReport) {
            return params.client;
        }

        return applyDiffReportToClient({
            client: params.client,
            openApi: params.openApi,
            openApiVersion: params.openApiVersion,
            diffReport: params.diffReport,
            prefix: params.context.prefix,
        });
    }

    async generate(rawOptions: TRawOptions) {
        const logger = new Logger({
            level: rawOptions.logLevel ?? COMMON_DEFAULT_OPTIONS_VALUES.logLevel!,
            instanceId: 'client',
            logOutput: rawOptions.logTarget ?? COMMON_DEFAULT_OPTIONS_VALUES.logTarget!,
        });
        this._writeClient = new WriteClient(logger);
        this.eslintFixOptions = extractEslintFixOptions(rawOptions);

        const items = this.normalizeOptions(rawOptions).map(item => this.addDefaultValues(item));
        await this.generateCodeForItems(items);
    }
}
