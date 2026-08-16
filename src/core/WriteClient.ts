import { ELogLevel, ELogOutput } from '../common/Enums';
import { Logger } from '../common/Logger';
import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { relativeHelper, resolveHelper } from '../common/utils/pathHelpers';
import { IndexCombineSession } from './IndexCombineSession';
import { LintTargetRegistry } from './LintTargetRegistry';
import { OutputFileSession } from './OutputFileSession';
import type { ReuseWriterContext } from './reuseStore/reuseWriterHelpers';
import { OutputPaths } from './types/base/OutputPaths.model';
import { Templates } from './types/base/Templates.model';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from './types/enums/HttpClient.enum';
import { ModelsLayout } from './types/enums/ModelsLayout.enum';
import { ModelsMode } from './types/enums/ModelsMode.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
import type { Model } from './types/shared/Model.model';
import { writeClientCore } from './utils/writeClientCore';
import { writeClientCoreIndex } from './utils/writeClientCoreIndex';
import { writeClientExecutor } from './utils/writeClientExecutor';
import { writeClientFullIndex } from './utils/writeClientFullIndex';
import { writeClientModels } from './utils/writeClientModels';
import { writeClientModelsIndex } from './utils/writeClientModelsIndex';
import { writeClientSchemas } from './utils/writeClientSchemas';
import { writeClientSchemasIndex } from './utils/writeClientSchemasIndex';
import { writeClientServices } from './utils/writeClientServices';
import { writeClientServicesIndex } from './utils/writeClientServicesIndex';
import { writeClientSimpleIndex } from './utils/writeClientSimpleIndex';
import { WriteFileIfChangedResult } from './utils/writeFileIfChanged';

/**
 * Параметры записи OpenAPI-клиента на диск.
 * @property client клиент со всеми моделями и сервисами
 * @property templates загруженные Handlebars-шаблоны
 * @property outputPaths относительные пути выходных директорий
 * @property httpClient выбранный HTTP-клиент
 * @property useOptions использовать options-функции вместо аргументов
 * @property useUnionTypes использовать union types вместо enum
 * @property excludeCoreServiceFiles исключить генерацию core и services
 * @property [request] путь к кастомному request-файлу
 * @property [customExecutorPath] путь к кастомному executor
 * @property [useCancelableRequest] использовать cancelable request type
 * @property [useSeparatedIndexes] писать отдельные index-файлы для core, models, schemas и services
 * @property [validationLibrary] библиотека валидации схем
 * @property emptySchemaStrategy стратегия обработки пустых схем
 * @property [modelsMode] режим генерации моделей
 * @property [modelsLayout] раскладка файлов моделей для classes mode
 * @property [prettierConfigPath] путь к конфигурации Prettier
 * @property [eslintConfigPath] путь к конфигурации ESLint
 */
type TWriteClientProps = {
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

/**
 * Thin facade over OutputFileSession, LintTargetRegistry, and IndexCombineSession.
 * Keeps per-item write orchestration and leaf writeClient* bindings.
 */
export class WriteClient {
    private readonly outputFiles: OutputFileSession;
    private readonly lintTargets: LintTargetRegistry;
    private readonly indexCombine: IndexCombineSession;
    private _logger: Logger;

    /**
     * @param [logger] логгер записи клиента
     */
    constructor(logger?: Logger) {
        this._logger =
            logger ||
            new Logger({
                level: ELogLevel.ERROR,
                instanceId: 'client',
                logOutput: ELogOutput.CONSOLE,
            });
        this.outputFiles = new OutputFileSession();
        this.lintTargets = new LintTargetRegistry();
        this.indexCombine = new IndexCombineSession();
    }

    /**
     * Записывает OpenAPI-клиент по шаблонам в выходные директории.
     * @param options параметры записи клиента
     */
    async writeClient(options: TWriteClientProps): Promise<void> {
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
            await this.writeClientCore({
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
            await this.writeClientCoreIndex({
                templates,
                outputCorePath: outputPaths.outputCore,
                useCancelableRequest,
                useSeparatedIndexes,
                modelsMode,
            });

            const { outputCore, outputServices, outputModels } = outputPaths;
            await fileSystemHelpers.mkdir(outputPaths.outputServices);
            await this.writeClientServices({
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
            await this.writeClientServicesIndex({
                services: client.services,
                templates,
                outputServices,
                useSeparatedIndexes,
            });
            await this.writeClientExecutor({
                outputPath: outputPaths.output,
                outputCorePath: relativeHelper(outputPaths.output, outputCore),
                services: client.services,
                templates,
                request,
                prettierConfigPath,
            });
        }

        let schemaModels: Model[] = [];
        if (validationLibrary !== ValidationLibrary.NONE) {
            await fileSystemHelpers.mkdir(outputPaths.outputSchemas);
            schemaModels = await this.writeClientSchemas({
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
            await this.writeClientSchemasIndex({
                models: schemaModels,
                templates,
                outputSchemasPath: outputPaths.outputSchemas,
                useSeparatedIndexes,
            });
        }
        await this.writeModelsAndFinalize({
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

    private async writeModelsAndFinalize(config: TWriteClientProps & { schemaModels: Model[] }) {
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
            await this.writeOutputFile(resolveHelper(outputPaths.outputModels, 'BaseDto.ts'), templates.core.baseDto({}));
            await this.writeOutputFile(resolveHelper(outputPaths.outputModels, 'dtoUtils.ts'), templates.core.dtoUtils({}));
        }
        await this.writeClientModels({
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
        await this.writeClientModelsIndex({
            models: client.models,
            templates,
            outputModelsPath: outputPaths.outputModels,
            useSeparatedIndexes,
            modelsMode,
            modelsLayout,
        });

        await fileSystemHelpers.mkdir(outputPaths.output);
        this.indexCombine.register({
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

    /** Собирает и записывает полный index клиента. */
    async combineAndWrite() {
        await this.indexCombine.combineAndWrite(this);
    }

    /** Собирает и записывает упрощённый index клиента. */
    async combineAndWrightSimple() {
        await this.indexCombine.combineAndWrightSimple(this);
    }

    /** Логгер записи клиента. */
    public get logger() {
        return this._logger;
    }

    public async writeOutputFile(filePath: string, content: string): Promise<WriteFileIfChangedResult> {
        return this.outputFiles.writeOutputFile(filePath, content);
    }

    public registerOutputFile(filePath: string): void {
        this.outputFiles.registerOutputFile(filePath);
    }

    public getExpectedOutputFiles(): Set<string> {
        return this.outputFiles.getExpectedOutputFiles();
    }

    public getExpectedOutputFilesArray(): string[] {
        return this.outputFiles.getExpectedOutputFilesArray();
    }

    public getWriteStats(): { written: number; unchanged: number } {
        return this.outputFiles.getWriteStats();
    }

    public registerLintTarget(filePath: string, outputRoot: string): void {
        this.lintTargets.registerLintTarget(filePath, outputRoot);
    }

    public getLintTargets(): { files: string[]; includeGlobs: string[] } {
        return this.lintTargets.getLintTargets();
    }

    public clearLintTargets(): void {
        this.lintTargets.clearLintTargets();
    }

    /** Делегирует запись core-части клиента. */
    public writeClientCore = writeClientCore;
    /** Делегирует запись index core-части. */
    public writeClientCoreIndex = writeClientCoreIndex;
    /** Делегирует запись полного index клиента. */
    public writeClientFullIndex = writeClientFullIndex;
    /** Делегирует запись моделей клиента. */
    public writeClientModels = writeClientModels;
    /** Делегирует запись index моделей. */
    public writeClientModelsIndex = writeClientModelsIndex;
    /** Делегирует запись схем клиента. */
    public writeClientSchemas = writeClientSchemas;
    /** Делегирует запись index схем. */
    public writeClientSchemasIndex = writeClientSchemasIndex;
    /** Делегирует запись сервисов клиента. */
    public writeClientServices = writeClientServices;
    /** Делегирует запись index сервисов. */
    public writeClientServicesIndex = writeClientServicesIndex;
    /** Делегирует запись упрощённого index клиента. */
    public writeClientSimpleIndex = writeClientSimpleIndex;
    /** Делегирует запись executor клиента. */
    public writeClientExecutor = writeClientExecutor;
}
