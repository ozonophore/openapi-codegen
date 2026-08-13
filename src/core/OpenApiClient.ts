import { COMMON_DEFAULT_OPTIONS_VALUES, DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../common/Consts';
import { Logger } from '../common/Logger';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import { extractEslintFixOptions, TEslintFixOptions } from '../common/TEslintFixOptions';
import { TFlatOptions, TRawOptions, TStrictFlatOptions } from '../common/TRawOptions';
import { resolveHelper } from '../common/utils/pathHelpers';
import { normalizeMarauderBoolean } from '../common/VersionedSchema/Utils/createBooleanToObjectSchema';
import { mergeMarauderBlockDeep } from '../common/VersionedSchema/Utils/mergeMarauderBlock';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import { Parser as ParserV2 } from './api/v2/Parser';
import { OpenApi as OpenApiV2 } from './api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from './api/v3/Parser';
import { OpenApi as OpenApiV3 } from './api/v3/types/OpenApi.model';
import { Context } from './Context';
import { GenerationBatchSession, type ItemRunContext } from './GenerationBatchSession';
import {
    buildCacheKey,
    buildEntityFingerprint,
    defaultFilesExist,
    getSpecItemName,
    resolveEntitySkipCandidate,
    shouldEntitySkip,
    usesEntityCache,
    usesReuseStoreForItem,
} from './generationCache/EntitySkip';
import { loadGovernanceConfig } from './governance/loadGovernanceConfig';
import { loadGeneratorPlugins } from './plugins/loadGeneratorPlugins';
import { extractPluginPaths } from './plugins/pluginEntries';
import { buildModelSchemaMap } from './reuseStore';
import { buildOptionsSlice } from './reuseStore/ArtifactFingerprinter';
import { runSpecAnalysis } from './specAnalysis/runSpecAnalysis';
import { validateOpenApiStrict, validateWithSwaggerParser, writeOpenApiStrictReport } from './strict/validateOpenApiStrict';
import { OutputPaths } from './types/base/OutputPaths.model';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { ModelsLayout } from './types/enums/ModelsLayout.enum';
import { ModelsMode } from './types/enums/ModelsMode.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
import { applyDiffReportToClient } from './utils/applyDiffReportToClient';
import type { GenerationCache } from './utils/GenerationCache';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { getOutputPaths } from './utils/getOutputPaths';
import { DiffReport, loadDiffReport } from './utils/loadDiffReport';
import { postProcessClient } from './utils/postProcessClient';
import { prepareDtoModels } from './utils/prepareDtoModels';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { resolveClassesModeTypes } from './utils/resolveClassesModeTypes';
import { WriteClient } from './WriteClient';

/**
 * Оркестратор генерации OpenAPI-клиента: парсинг спецификации, применение diff-отчёта и запись артефактов.
 */
export class OpenApiClient {
    private _writeClient: WriteClient | null = null;
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
                disableBuiltinPlugins: (item as TFlatOptions).disableBuiltinPlugins ?? rawOptions.disableBuiltinPlugins,
                strictPluginMode: (item as TFlatOptions).strictPluginMode ?? rawOptions.strictPluginMode,
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
                    disableBuiltinPlugins: rawOptions.disableBuiltinPlugins,
                    strictPluginMode: rawOptions.strictPluginMode,
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
            disableBuiltinPlugins: item.disableBuiltinPlugins ?? COMMON_DEFAULT_OPTIONS_VALUES.disableBuiltinPlugins,
            strictPluginMode: item.strictPluginMode ?? COMMON_DEFAULT_OPTIONS_VALUES.strictPluginMode,
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

    private async generateSingle(item: TStrictFlatOptions, generationCache: GenerationCache | null, itemRunContext?: ItemRunContext): Promise<{ entitySkipped: boolean }> {
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
            disableBuiltinPlugins,
            strictPluginMode,
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
        const cacheKey = buildCacheKey(item, absoluteInput);
        const useEntityCache = usesEntityCache(item, generationCache);
        const useReuseStore = usesReuseStoreForItem(item, itemRunContext?.reuseStore ?? null);
        const cacheFingerprint = useEntityCache ? await buildEntityFingerprint(item, absoluteInput) : '';
        const specInput = getSpecItemName(item.input);
        const optionsSlice = buildOptionsSlice(item);
        if (useEntityCache) {
            const willEntitySkip = await resolveEntitySkipCandidate({
                useEntityCache,
                generationCache,
                cacheKey,
                cacheFingerprint,
                useReuseStore,
                reuseStore: itemRunContext?.reuseStore ?? null,
                specInput,
                filesExist: defaultFilesExist,
            });
            if (willEntitySkip) {
                const cachedEntry = generationCache!.get(cacheKey)!;
                for (const filePath of cachedEntry.files) {
                    this.writeClient.registerOutputFile(filePath);
                }
                if (item.cacheDebug) {
                    this.writeClient.logger.info(LOGGER_MESSAGES.GENERATION.CACHE_HIT(input));
                }
                return { entitySkipped: true };
            }
            if (item.cacheDebug) {
                this.writeClient.logger.info(LOGGER_MESSAGES.GENERATION.CACHE_MISS(input));
            }
        }
        const knownFilesBefore = new Set(this.writeClient.getExpectedOutputFilesArray());
        const generatorPlugins = await loadGeneratorPlugins(extractPluginPaths(plugins), {
            disableBuiltins: disableBuiltinPlugins,
        });
        const context = new Context({
            input: absoluteInput,
            output: outputPaths,
            prefix: { interface: interfacePrefix, enum: enumPrefix, type: typePrefix },
            sortByRequired,
            plugins: generatorPlugins,
            strictPluginMode,
        });
        const openApi = await getOpenApiSpec(context, absoluteInput);

        if (specAnalysis?.enabled) {
            await runSpecAnalysis(openApi, { ...specAnalysis, enabled: true }, this.writeClient.logger, getSpecItemName(input), itemRunContext?.specAnalysisAccumulator ?? undefined, {
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
                    reuseStore: useReuseStore ? itemRunContext!.reuseStore! : undefined,
                    optionsSlice: useReuseStore ? optionsSlice : undefined,
                    specInput: useReuseStore ? specInput : undefined,
                    inputPath: useReuseStore ? absoluteInput : undefined,
                    modelSchemas: useReuseStore ? modelSchemas : undefined,
                    referencedArtifactKeys: useReuseStore ? itemRunContext!.referencedArtifactKeys : undefined,
                    onReuseStat: useReuseStore ? itemRunContext!.onReuseStat : undefined,
                    reuseOnConflict: useReuseStore ? item.reuseOnConflict : undefined,
                    sharedFolderWriter: useReuseStore ? itemRunContext!.sharedFolderWriter : undefined,
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
                    reuseStore: useReuseStore ? itemRunContext!.reuseStore! : undefined,
                    optionsSlice: useReuseStore ? optionsSlice : undefined,
                    specInput: useReuseStore ? specInput : undefined,
                    inputPath: useReuseStore ? absoluteInput : undefined,
                    modelSchemas: useReuseStore ? modelSchemas : undefined,
                    referencedArtifactKeys: useReuseStore ? itemRunContext!.referencedArtifactKeys : undefined,
                    onReuseStat: useReuseStore ? itemRunContext!.onReuseStat : undefined,
                    reuseOnConflict: useReuseStore ? item.reuseOnConflict : undefined,
                    sharedFolderWriter: useReuseStore ? itemRunContext!.sharedFolderWriter : undefined,
                });
                break;
            }
        }
        const generatedFiles = this.writeClient.getExpectedOutputFilesArray().filter(filePath => !knownFilesBefore.has(filePath));
        if (item.cache && generationCache && (item.cacheStrategy === 'entity' || item.cacheStrategy === 'reuse')) {
            generationCache.set({
                key: cacheKey,
                fingerprint: cacheFingerprint,
                files: generatedFiles,
                updatedAt: Date.now(),
            });
        }

        return { entitySkipped: false };
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
        const session = new GenerationBatchSession({
            writeClient: this.writeClient,
            eslintFixOptions: this.eslintFixOptions,
            generateItem: (item, generationCache, itemRunContext) => this.generateSingle(item, generationCache, itemRunContext),
            shouldEntitySkip: (item, generationCache, reuseStore) => shouldEntitySkip({ item, generationCache, reuseStore }),
        });
        await session.run(items, rawOptions);
    }
}
