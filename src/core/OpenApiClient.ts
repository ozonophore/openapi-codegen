import { COMMON_DEFAULT_OPTIONS_VALUES } from '../common/Consts';
import { Logger } from '../common/Logger';
import { extractEslintFixOptions, TEslintFixOptions } from '../common/TEslintFixOptions';
import { TFlatOptions, TRawOptions, TStrictFlatOptions } from '../common/TRawOptions';
import { normalizeMarauderBoolean } from '../common/VersionedSchema/Utils/createBooleanToObjectSchema';
import { mergeMarauderBlockDeep } from '../common/VersionedSchema/Utils/mergeMarauderBlock';
import { resolveSpecAnalysisConfig } from '../common/VersionedSchema/Utils/resolveSpecAnalysisConfig';
import { GenerationBatchSession } from './GenerationBatchSession';
import { shouldEntitySkip } from './generationCache/EntitySkip';
import { GenerationItemSession } from './GenerationItemSession';
import { WriteClient } from './WriteClient';

/**
 * Facade: options normalize/defaults; constructs WriteClient, Generation item session, and Generation batch session.
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
        const itemSession = new GenerationItemSession({
            writeClient: this.writeClient,
            eslintFixOptions: this.eslintFixOptions,
        });
        const session = new GenerationBatchSession({
            writeClient: this.writeClient,
            eslintFixOptions: this.eslintFixOptions,
            generateItem: (item, generationCache, itemRunContext) => itemSession.run(item, generationCache, itemRunContext),
            shouldEntitySkip: (item, generationCache, reuseStore) => shouldEntitySkip({ item, generationCache, reuseStore }),
        });
        await session.run(items, rawOptions);
    }
}
