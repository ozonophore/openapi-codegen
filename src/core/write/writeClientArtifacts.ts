import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import type { CoreOutputAdapter } from '../CoreOutputAdapter';
import type { APIClientGeneratorConfig } from '../IndexCombineSession';
import type { ReuseWriterContext } from '../reuseStore/reuseWriterHelpers';
import { OutputPaths } from '../types/base/OutputPaths.model';
import { Templates } from '../types/base/Templates.model';
import { EmptySchemaStrategy } from '../types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ModelsLayout } from '../types/enums/ModelsLayout.enum';
import { ModelsMode } from '../types/enums/ModelsMode.enum';
import { ValidationLibrary } from '../types/enums/ValidationLibrary.enum';
import type { Client } from '../types/shared/Client.model';
import type { Model } from '../types/shared/Model.model';
import { writeClientCore } from './writeClientCore';
import { writeClientCoreIndex } from './writeClientCoreIndex';
import { writeClientExecutor } from './writeClientExecutor';
import { writeClientModels } from './writeClientModels';
import { writeClientModelsIndex } from './writeClientModelsIndex';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientSchemasIndex } from './writeClientSchemasIndex';
import { writeClientServices } from './writeClientServices';
import { writeClientServicesIndex } from './writeClientServicesIndex';

/**
 * Параметры записи OpenAPI-клиента на диск.
 */
export type TWriteClientProps = {
    client: Client;
    templates: Templates;
    outputPaths: OutputPaths;
    httpClient: HttpClient;
    useOptions: boolean;
    useUnionTypes: boolean;
    excludeCoreServiceFiles: boolean;
    request?: string;
    customExecutorPath?: string;
    useCancelableRequest?: boolean;
    useSeparatedIndexes?: boolean;
    validationLibrary?: ValidationLibrary;
    emptySchemaStrategy: EmptySchemaStrategy;
    modelsMode?: ModelsMode;
    modelsLayout?: ModelsLayout;
    prettierConfigPath?: string;
    reuse?: ReuseWriterContext;
};

/** Narrow IndexCombine seam used at end of per-item write. */
export type WriteClientArtifactsIndexCombine = {
    register: (config: APIClientGeneratorConfig) => void;
};

/** Leaf writers; defaults are the free writeClient* functions. Overridable in tests. */
export type WriteClientArtifactsLeaves = {
    writeClientCore: typeof writeClientCore;
    writeClientCoreIndex: typeof writeClientCoreIndex;
    writeClientServices: typeof writeClientServices;
    writeClientServicesIndex: typeof writeClientServicesIndex;
    writeClientExecutor: typeof writeClientExecutor;
    writeClientSchemas: typeof writeClientSchemas;
    writeClientSchemasIndex: typeof writeClientSchemasIndex;
    writeClientModels: typeof writeClientModels;
    writeClientModelsIndex: typeof writeClientModelsIndex;
};

const defaultLeaves: WriteClientArtifactsLeaves = {
    writeClientCore,
    writeClientCoreIndex,
    writeClientServices,
    writeClientServicesIndex,
    writeClientExecutor,
    writeClientSchemas,
    writeClientSchemasIndex,
    writeClientModels,
    writeClientModelsIndex,
};

/**
 * Per-item client artifact write order: mkdir + core/services/schemas/models + IndexCombine register.
 */
export async function writeClientArtifacts(
    adapter: CoreOutputAdapter,
    indexCombine: WriteClientArtifactsIndexCombine,
    options: TWriteClientProps,
    leaves: WriteClientArtifactsLeaves = defaultLeaves
): Promise<void> {
    const {
        client,
        templates,
        outputPaths,
        httpClient,
        useOptions,
        useUnionTypes,
        excludeCoreServiceFiles = false,
        request,
        customExecutorPath,
        useCancelableRequest = false,
        useSeparatedIndexes = false,
        validationLibrary = ValidationLibrary.NONE,
        emptySchemaStrategy,
        modelsMode,
        modelsLayout,
        prettierConfigPath,
        reuse,
    } = options;

    if (!excludeCoreServiceFiles) {
        const executorPath = resolveHelper(outputPaths.outputCore, 'executor');
        const interceptorsPath = resolveHelper(outputPaths.outputCore, 'interceptors');
        await fileSystemHelpers.mkdir(outputPaths.outputCore);
        await fileSystemHelpers.mkdir(executorPath);
        await fileSystemHelpers.mkdir(interceptorsPath);
        await leaves.writeClientCore(adapter, {
            client,
            templates,
            outputCorePath: outputPaths.outputCore,
            httpClient,
            request,
            useCancelableRequest,
            customExecutorPath,
            modelsMode,
            sharedFolderWriter: reuse?.sharedFolderWriter,
        });
        await leaves.writeClientCoreIndex(adapter, {
            templates,
            outputCorePath: outputPaths.outputCore,
            useCancelableRequest,
            useSeparatedIndexes,
            modelsMode,
        });

        const { outputCore, outputServices, outputModels } = outputPaths;
        await fileSystemHelpers.mkdir(outputPaths.outputServices);
        await leaves.writeClientServices(adapter, {
            services: client.services,
            templates,
            outputPaths: {
                outputServices,
                outputCore: `${relativeHelper(outputServices, outputCore)}`,
                outputModels: `${relativeHelper(outputServices, outputModels)}`,
            },
            httpClient,
            useUnionTypes,
            useOptions,
            useCancelableRequest,
            prettierConfigPath,
            modelsMode,
            modelsLayout,
        });
        await leaves.writeClientServicesIndex(adapter, {
            services: client.services,
            templates,
            outputServices,
            useSeparatedIndexes,
        });
        await leaves.writeClientExecutor(adapter, {
            outputPath: outputPaths.output,
            outputCorePath: relativeHelper(outputPaths.output, outputCore),
            services: client.services,
            templates,
            request,
            prettierConfigPath,
        });
    }

    /**
     * TODO: Нужно собирать импорты из всех вложенных моделей (link, properties в composition и т.д.) и передавать их в шаблон.
     * Это делается в writeClientSchemas или в парсере моделей.
     */
    let schemaModels: Model[] = [];
    if (validationLibrary !== ValidationLibrary.NONE) {
        await fileSystemHelpers.mkdir(outputPaths.outputSchemas);
        schemaModels = await leaves.writeClientSchemas(adapter, {
            models: client.models,
            templates,
            outputSchemasPath: outputPaths.outputSchemas,
            httpClient,
            useUnionTypes,
            validationLibrary,
            emptySchemaStrategy,
            prettierConfigPath,
            reuse,
        });
        await leaves.writeClientSchemasIndex(adapter, {
            models: schemaModels,
            templates,
            outputSchemasPath: outputPaths.outputSchemas,
            useSeparatedIndexes,
        });
    }
    await writeModelsAndFinalize(adapter, indexCombine, leaves, {
        client,
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
        schemaModels,
        prettierConfigPath,
        reuse,
    });
}

async function writeModelsAndFinalize(
    adapter: CoreOutputAdapter,
    indexCombine: WriteClientArtifactsIndexCombine,
    leaves: WriteClientArtifactsLeaves,
    config: TWriteClientProps & { schemaModels: Model[] }
): Promise<void> {
    const {
        client,
        templates,
        outputPaths,
        httpClient,
        useUnionTypes,
        useOptions,
        useSeparatedIndexes,
        excludeCoreServiceFiles,
        validationLibrary,
        emptySchemaStrategy,
        modelsMode,
        modelsLayout,
        schemaModels,
        prettierConfigPath,
        reuse,
    } = config;

    await fileSystemHelpers.mkdir(outputPaths.outputModels);
    const shouldInlineDtoCore = modelsMode === ModelsMode.CLASSES && excludeCoreServiceFiles;
    if (shouldInlineDtoCore) {
        await adapter.writeOutputFile(resolveHelper(outputPaths.outputModels, 'BaseDto.ts'), templates.core.baseDto({}));
        await adapter.writeOutputFile(resolveHelper(outputPaths.outputModels, 'dtoUtils.ts'), templates.core.dtoUtils({}));
    }
    await leaves.writeClientModels(adapter, {
        models: client.models,
        templates,
        outputModelsPath: outputPaths.outputModels,
        httpClient,
        useUnionTypes,
        useOptions,
        modelsMode,
        modelsLayout,
        outputCorePath: shouldInlineDtoCore ? './' : relativeHelper(outputPaths.outputModels, outputPaths.outputCore),
        prettierConfigPath,
        reuse,
    });
    await leaves.writeClientModelsIndex(adapter, {
        models: client.models,
        templates,
        outputModelsPath: outputPaths.outputModels,
        useSeparatedIndexes,
        modelsMode,
        modelsLayout,
    });

    await fileSystemHelpers.mkdir(outputPaths.output);
    indexCombine.register({
        client,
        templates,
        outputPaths,
        useUnionTypes,
        excludeCoreServiceFiles,
        validationLibrary,
        emptySchemaStrategy,
        schemaModels,
        modelsMode,
        modelsLayout,
    });
}
