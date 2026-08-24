import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import type { TEslintFixOptions } from '../common/TEslintFixOptions';
import type { TStrictFlatOptions } from '../common/TRawOptions';
import { resolveHelper } from '../common/utils/pathHelpers';
import { Parser as ParserV2 } from './api/v2/Parser';
import { OpenApi as OpenApiV2 } from './api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from './api/v3/Parser';
import { OpenApi as OpenApiV3 } from './api/v3/types/OpenApi.model';
import { postProcessClient } from './clientPrep/postProcessClient';
import { prepareDtoModels } from './clientPrep/prepareDtoModels';
import { registerHandlebarTemplates } from './clientPrep/registerHandlebarTemplates';
import { resolveClassesModeTypes } from './clientPrep/resolveClassesModeTypes';
import { Context } from './Context';
import { createResolvedContext } from './createResolvedContext';
import { applyHistoryDiffToClient } from './diffReport';
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
        const generatorPlugins = await loadGeneratorPlugins(mergePluginPaths(plugins, null), {
            disableBuiltins: disableBuiltinPlugins,
        });
        const { context, map, openApi } = await createResolvedContext({
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
        writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.DEFINING_VERSION);
        let clientPrepared: Client;
        switch (openApiVersion) {
            case OpenApiVersion.V2: {
                clientPrepared = this.prepareClientFromOpenApi({
                    parse: () => new ParserV2(context, map).parse(openApi as OpenApiV2),
                    openApi,
                    openApiVersion,
                    context,
                    miracles,
                    modelsMode,
                    useHistory,
                    diffReport,
                    inputPath: absoluteInput,
                    logger: writeClient.logger,
                });
                writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V2);
                break;
            }

            case OpenApiVersion.V3: {
                clientPrepared = this.prepareClientFromOpenApi({
                    parse: () => new ParserV3(context, map).parse(openApi as OpenApiV3),
                    openApi,
                    openApiVersion,
                    context,
                    miracles,
                    modelsMode,
                    useHistory,
                    diffReport,
                    inputPath: absoluteInput,
                    logger: writeClient.logger,
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
        const writeProps = {
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
        };
        const generatedFiles = await writeClient.writeClient(writeProps);
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
     * Shared V2/V3 prepare: parse → history Diff → postProcess → optional classes/DTO.
     */
    private prepareClientFromOpenApi(params: {
        parse: () => Client;
        openApi: unknown;
        openApiVersion: OpenApiVersion;
        context: Context;
        miracles?: TStrictFlatOptions['miracles'];
        modelsMode?: ModelsMode;
        useHistory?: boolean;
        diffReport?: string;
        inputPath?: string;
        logger: WriteClient['logger'];
    }): Client {
        const client = params.parse();
        const clientWithDiff = applyHistoryDiffToClient({
            client,
            openApi: params.openApi as Record<string, unknown>,
            openApiVersion: params.openApiVersion,
            context: params.context,
            miracles: params.miracles,
            useHistory: params.useHistory,
            diffReport: params.diffReport,
            inputPath: params.inputPath,
            logger: params.logger,
        });
        const clientFinal = postProcessClient(clientWithDiff);
        return params.modelsMode === ModelsMode.CLASSES ? resolveClassesModeTypes(prepareDtoModels(clientFinal)) : clientFinal;
    }
}
