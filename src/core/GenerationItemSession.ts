import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import type { TEslintFixOptions } from '../common/TEslintFixOptions';
import type { TStrictFlatOptions } from '../common/TRawOptions';
import { resolveHelper } from '../common/utils/pathHelpers';
import { postProcessClient } from './clientPrep/postProcessClient';
import { prepareDtoModels } from './clientPrep/prepareDtoModels';
import { registerHandlebarTemplates } from './clientPrep/registerHandlebarTemplates';
import { resolveClassesModeTypes } from './clientPrep/resolveClassesModeTypes';
import { Context } from './Context';
import { applyHistoryDiffToClient } from './diffReport';
import type { ItemRunContext } from './GenerationBatchSession';
import { buildCacheKey, buildEntityFingerprint, getSpecItemName, usesEntityCache } from './generationCache/EntitySkip';
import { GenerationCache } from './generationCache/GenerationCache';
import { buildReuseProps, loadItemPlugins, loadItemSpec, parseAndPrepareClient, resolveEntitySkip } from './itemRun';
import { buildModelSchemaMap } from './reuseStore';
import { buildOptionsSlice } from './reuseStore/ArtifactFingerprinter';
import { runSpecAnalysis } from './specAnalysis/runSpecAnalysis';
import { runStrictOpenApiGate } from './strict/runStrictOpenApiGate';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { ModelsMode } from './types/enums/ModelsMode.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
import { OpenApiVersion } from './utils/getOpenApiVersion';
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
        const outputPaths = getOutputPaths(item);
        const absoluteInput = resolveHelper(process.cwd(), item.input);
        const specInput = getSpecItemName(item.input);
        const optionsSlice = buildOptionsSlice(item);
        const cacheKey = buildCacheKey(item, absoluteInput);
        const cacheFingerprint = usesEntityCache(item, generationCache) ? await buildEntityFingerprint(item, absoluteInput) : '';

        const skipResult = await resolveEntitySkip(item, absoluteInput, generationCache, itemRunContext.reuseStore, specInput);
        if (skipResult.skipped) {
            skipResult.files.forEach(f => writeClient.registerOutputFile(f));
            if (skipResult.cacheDebug) writeClient.logger.info(LOGGER_MESSAGES.GENERATION.CACHE_HIT(skipResult.input));
            return { entitySkipped: true };
        }
        if (item.cacheDebug && usesEntityCache(item, generationCache)) writeClient.logger.info(LOGGER_MESSAGES.GENERATION.CACHE_MISS(item.input));

        const plugins = await loadItemPlugins(item.plugins, item.disableBuiltinPlugins);
        const spec = await loadItemSpec(absoluteInput, outputPaths, item, plugins);

        if (item.specAnalysis?.enabled)
            await runSpecAnalysis(spec.openApi, { ...item.specAnalysis, enabled: true }, writeClient.logger, specInput, itemRunContext.specAnalysisAccumulator ?? undefined, {
                interface: item.interfacePrefix,
                enum: item.enumPrefix,
                type: item.typePrefix,
            });
        if (item.strictOpenapi)
            await runStrictOpenApiGate({
                absoluteInput,
                openApi: spec.openApi,
                context: spec.context,
                reportFile: item.reportFile,
                governanceConfig: item.governanceConfig,
                failOnGovernanceErrors: item.failOnGovernanceErrors,
                logger: writeClient.logger,
            });

        const templates = registerHandlebarTemplates({
            httpClient: item.httpClient,
            useUnionTypes: item.useUnionTypes,
            useOptions: item.useOptions,
            validationLibrary: item.validationLibrary ?? ValidationLibrary.NONE,
            useBatchEslintFix: Boolean(eslintFixOptions.tsconfigPath && eslintFixOptions.eslintConfigPath),
        });
        const client = parseAndPrepareClient(spec, item, this.prepareClientFromOpenApi.bind(this), absoluteInput, writeClient.logger);
        const reuse = buildReuseProps(item, itemRunContext, buildModelSchemaMap(spec.context), absoluteInput, specInput, optionsSlice);
        const generatedFiles = await writeClient.writeClient({
            client,
            templates,
            outputPaths,
            httpClient: item.httpClient,
            useOptions: item.useOptions,
            useUnionTypes: item.useUnionTypes,
            excludeCoreServiceFiles: item.excludeCoreServiceFiles,
            request: item.request,
            customExecutorPath: item.customExecutorPath,
            useCancelableRequest: item.useCancelableRequest,
            useSeparatedIndexes: item.useSeparatedIndexes,
            validationLibrary: item.validationLibrary ?? ValidationLibrary.NONE,
            emptySchemaStrategy: item.emptySchemaStrategy ?? EmptySchemaStrategy.KEEP,
            modelsMode: item.modelsMode ?? ModelsMode.INTERFACES,
            modelsLayout: item.modelsLayout,
            prettierConfigPath: item.prettierConfigPath,
            reuse,
        });

        if (item.cache && generationCache && (item.cacheStrategy === 'entity' || item.cacheStrategy === 'reuse'))
            generationCache.set({ key: cacheKey, fingerprint: cacheFingerprint, files: generatedFiles, updatedAt: Date.now() });
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
        modelsMode?: TStrictFlatOptions['modelsMode'];
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
