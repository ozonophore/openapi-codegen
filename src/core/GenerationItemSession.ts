import { DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../common/Consts';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import type { TEslintFixOptions } from '../common/TEslintFixOptions';
import type { TStrictFlatOptions } from '../common/TRawOptions';
import { resolveHelper } from '../common/utils/pathHelpers';
import { Parser as ParserV2 } from './api/v2/Parser';
import { OpenApi as OpenApiV2 } from './api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from './api/v3/Parser';
import { OpenApi as OpenApiV3 } from './api/v3/types/OpenApi.model';
import { Context } from './Context';
import { createResolvedContext } from './createResolvedContext';
import { applyDiffReportToClient, DiffReport, loadDiffReport } from './diffReport';
import type { ItemRunContext } from './GenerationBatchSession';
import { buildCacheKey, buildEntityFingerprint, defaultFilesExist, getSpecItemName, resolveEntitySkipCandidate, usesEntityCache, usesReuseStoreForItem } from './generationCache/EntitySkip';
import { GenerationCache } from './generationCache/GenerationCache';
import { loadGeneratorPlugins } from './plugins/loadGeneratorPlugins';
import { mergePluginPaths } from './plugins/pluginEntries';
import { buildModelSchemaMap } from './reuseStore';
import { buildOptionsSlice } from './reuseStore/ArtifactFingerprinter';
import { runSpecAnalysis } from './specAnalysis/runSpecAnalysis';
import { runStrictOpenApiGate } from './strict/runStrictOpenApiGate';
import { OutputPaths } from './types/base/OutputPaths.model';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { ModelsLayout } from './types/enums/ModelsLayout.enum';
import { ModelsMode } from './types/enums/ModelsMode.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { getOutputPaths } from './utils/getOutputPaths';
import { postProcessClient } from './utils/postProcessClient';
import { prepareDtoModels } from './utils/prepareDtoModels';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { resolveClassesModeTypes } from './utils/resolveClassesModeTypes';
import type { WriteClient } from './write/WriteClient';

export type GenerationItemSessionDeps = {
    writeClient: WriteClient;
    eslintFixOptions: TEslintFixOptions;
};

/**
 * Owns the per-item Generation lifecycle (EntitySkip → parse → Client → Write → cache set).
 * Wired by the facade into GenerationBatchSession via `generateItem`.
 */
export class GenerationItemSession {
    constructor(private readonly deps: GenerationItemSessionDeps) {}

    async run(item: TStrictFlatOptions, generationCache: GenerationCache | null, itemRunContext: ItemRunContext): Promise<{ entitySkipped: boolean }> {
        const { writeClient, eslintFixOptions } = this.deps;
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
        const useReuseStore = usesReuseStoreForItem(item, itemRunContext.reuseStore);
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
                reuseStore: itemRunContext.reuseStore,
                specInput,
                filesExist: defaultFilesExist,
            });
            if (willEntitySkip) {
                const cachedEntry = generationCache!.get(cacheKey)!;
                for (const filePath of cachedEntry.files) {
                    writeClient.registerOutputFile(filePath);
                }
                if (item.cacheDebug) {
                    writeClient.logger.info(LOGGER_MESSAGES.GENERATION.CACHE_HIT(input));
                }
                return { entitySkipped: true };
            }
            if (item.cacheDebug) {
                writeClient.logger.info(LOGGER_MESSAGES.GENERATION.CACHE_MISS(input));
            }
        }
        const knownFilesBefore = new Set(writeClient.getExpectedOutputFilesArray());
        const generatorPlugins = await loadGeneratorPlugins(mergePluginPaths(plugins, null), {
            disableBuiltins: disableBuiltinPlugins,
        });
        const { context, openApi } = await createResolvedContext({
            input: absoluteInput,
            output: outputPaths,
            prefix: { interface: interfacePrefix, enum: enumPrefix, type: typePrefix },
            sortByRequired,
            plugins: generatorPlugins,
            strictPluginMode,
        });

        if (specAnalysis?.enabled) {
            await runSpecAnalysis(openApi, { ...specAnalysis, enabled: true }, writeClient.logger, getSpecItemName(input), itemRunContext.specAnalysisAccumulator ?? undefined, {
                interface: interfacePrefix,
                enum: enumPrefix,
                type: typePrefix,
            });
        }

        if (strictOpenapi) {
            await runStrictOpenApiGate({
                absoluteInput,
                openApi,
                context,
                reportFile,
                governanceConfig,
                failOnGovernanceErrors,
                logger: writeClient.logger,
            });
        }

        const openApiVersion = getOpenApiVersion(openApi);
        const templates = registerHandlebarTemplates({
            httpClient,
            useUnionTypes,
            useOptions,
            validationLibrary,
            useBatchEslintFix: Boolean(eslintFixOptions.tsconfigPath && eslintFixOptions.eslintConfigPath),
        });
        const diffReportData = await this.loadDiffReportIfNeeded({
            useHistory,
            diffReport,
            inputPath: absoluteInput,
        });
        if (useHistory && !diffReportData) {
            const reportPath = diffReport || DEFAULT_ANALYZE_DIFF_REPORT_PATH;
            writeClient.logger.warn(LOGGER_MESSAGES.DIFF_REPORT.USE_HISTORY_NO_REPORT(reportPath));
        }
        writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.DEFINING_VERSION);
        let clientPrepared: Client;
        switch (openApiVersion) {
            case OpenApiVersion.V2: {
                clientPrepared = this.prepareClientFromOpenApi({
                    parse: () => new ParserV2(context).parse(openApi as OpenApiV2),
                    openApi,
                    openApiVersion,
                    diffReport: diffReportData,
                    context,
                    miracles,
                    modelsMode,
                });
                writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V2);
                break;
            }

            case OpenApiVersion.V3: {
                clientPrepared = this.prepareClientFromOpenApi({
                    parse: () => new ParserV3(context).parse(openApi as OpenApiV3),
                    openApi,
                    openApiVersion,
                    diffReport: diffReportData,
                    context,
                    miracles,
                    modelsMode,
                });
                writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V3);
                break;
            }
        }
        const modelSchemas = buildModelSchemaMap(context);
        const reuse =
            useReuseStore && itemRunContext.reuseStore
                ? {
                      reuseStore: itemRunContext.reuseStore,
                      optionsSlice,
                      specInput,
                      inputPath: absoluteInput,
                      modelSchemas,
                      referencedArtifactKeys: itemRunContext.referencedArtifactKeys,
                      onReuseStat: itemRunContext.onReuseStat,
                      reuseOnConflict: item.reuseOnConflict,
                      prettierConfigPath,
                      sharedFolderWriter: itemRunContext.sharedFolderWriter,
                  }
                : undefined;
        await writeClient.writeClient({
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
            reuse,
        });
        const generatedFiles = writeClient.getExpectedOutputFilesArray().filter(filePath => !knownFilesBefore.has(filePath));
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

    /**
     * Shared V2/V3 prepare: parse → optional Diff apply → postProcess → optional classes/DTO.
     */
    private prepareClientFromOpenApi(params: {
        parse: () => Client;
        openApi: unknown;
        openApiVersion: OpenApiVersion;
        diffReport: DiffReport | null;
        context: Context;
        miracles?: TStrictFlatOptions['miracles'];
        modelsMode?: ModelsMode;
    }): Client {
        const client = params.parse();
        const clientWithDiff = this.applyDiffReportIfNeeded({
            client,
            openApi: params.openApi as Record<string, unknown>,
            openApiVersion: params.openApiVersion,
            diffReport: params.diffReport,
            context: params.context,
            miracles: params.miracles,
        });
        const clientFinal = postProcessClient(clientWithDiff);
        return params.modelsMode === ModelsMode.CLASSES ? resolveClassesModeTypes(prepareDtoModels(clientFinal)) : clientFinal;
    }

    private async loadDiffReportIfNeeded(params: { useHistory?: boolean; diffReport?: string; inputPath?: string }): Promise<DiffReport | null> {
        return loadDiffReport({
            useHistory: params.useHistory,
            diffReport: params.diffReport,
            inputPath: params.inputPath,
            logger: this.deps.writeClient.logger,
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
}
