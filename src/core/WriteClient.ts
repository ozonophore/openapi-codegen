import { ELogLevel, ELogOutput } from '../common/Enums';
import { Logger } from '../common/Logger';
import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { relativeHelper, resolveHelper } from '../common/utils/pathHelpers';
import { ClientArtifacts } from './types/base/ClientArtifacts.model';
import { ExportedModel } from './types/base/ExportedModel.model';
import { ExportedService } from './types/base/ExportedService.model';
import { OutputPaths } from './types/base/OutputPaths.model';
import { SimpleClientArtifacts } from './types/base/SimpleClientArtifacts.model';
import { Templates } from './types/base/Templates.model';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from './types/enums/HttpClient.enum';
import { ModelsMode } from './types/enums/ModelsMode.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
import type { Model } from './types/shared/Model.model';
import { prepareAlias } from './utils/prepareAlias';
import { sortModelByName } from './utils/sortModelByName';
import { unique } from './utils/unique';
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
import { writeFileIfChanged, WriteFileIfChangedResult } from './utils/writeFileIfChanged';

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
 * @property [useProjectPrettier] форматировать через Prettier проекта
 * @property [useEslintFix] применять ESLint fix к сгенерированным файлам
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
    prettierConfigPath?: string;
};

type TAPIClientGeneratorConfig = Omit<TWriteClientProps, 'httpClient' | 'useOptions' | 'request' | 'useCancelableRequest' | 'useSeparatedIndexes'> & {
    schemaModels: Model[];
};

/**
 * Клиент записи сгенерированных артефактов и сборки index-файлов.
 */
export class WriteClient {
    private config: Map<string, TAPIClientGeneratorConfig[]> = new Map();
    private expectedOutputFiles: Set<string> = new Set();
    private writeStats = { written: 0, unchanged: 0 };
    /** Absolute paths of generated model/service files for batch ESLint. */
    private lintTargetFiles = new Set<string>();
    /** Output directory globs for the temporary tsconfig include. */
    private lintIncludeGlobs = new Set<string>();
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
            prettierConfigPath,
        } = options;

        if (!excludeCoreServiceFiles) {
            const executorPath = resolveHelper(outputPaths.outputCore, 'executor');
            const interceptorsPath = resolveHelper(outputPaths.outputCore, 'interceptors');
            await fileSystemHelpers.mkdir(outputPaths.outputCore);
            await fileSystemHelpers.mkdir(executorPath);
            await fileSystemHelpers.mkdir(interceptorsPath);
            await this.writeClientCore({ client, templates, outputCorePath: outputPaths.outputCore, httpClient, request, useCancelableRequest, customExecutorPath, modelsMode });
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

        /**
         * TODO: Нужно собирать импорты из всех вложенных моделей (link, properties в composition и т.д.) и передавать их в шаблон.
         * Это делается в writeClientSchemas или в парсере моделей.
         */
        if (validationLibrary !== ValidationLibrary.NONE) {
            await fileSystemHelpers.mkdir(outputPaths.outputSchemas);
            const schemaModels = await this.writeClientSchemas({
                models: client.models,
                templates,
                outputSchemasPath: outputPaths.outputSchemas,
                httpClient,
                useUnionTypes,
                validationLibrary,
                emptySchemaStrategy,
                prettierConfigPath,
            });
            await this.writeClientSchemasIndex({
                models: schemaModels,
                templates,
                outputSchemasPath: outputPaths.outputSchemas,
                useSeparatedIndexes,
            });
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
                schemaModels,
                prettierConfigPath,
            });
            return;
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
            schemaModels: [],
            prettierConfigPath,
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
            schemaModels,
            prettierConfigPath,
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
            outputCorePath: shouldInlineDtoCore ? './' : relativeHelper(outputPaths.outputModels, outputPaths.outputCore),
            prettierConfigPath,
        });
        await this.writeClientModelsIndex({
            models: client.models,
            templates,
            outputModelsPath: outputPaths.outputModels,
            useSeparatedIndexes,
            modelsMode,
        });

        await fileSystemHelpers.mkdir(outputPaths.output);
        this.buildClientGeneratorConfigMap({
            client,
            templates,
            outputPaths,
            useUnionTypes,
            excludeCoreServiceFiles,
            validationLibrary,
            emptySchemaStrategy,
            schemaModels,
            modelsMode,
        });
    }

    /**
     * Сохраняет конфигурацию генератора для последующей сборки index-файла.
     * @param config конфигурация генератора клиента
     */
    buildClientGeneratorConfigMap(config: TAPIClientGeneratorConfig) {
        const { outputPaths } = config;
        const values = this.config.get(outputPaths.output);
        if (values) {
            values.push(config);
        } else {
            this.config.set(outputPaths.output, Array.of(config));
        }
    }

    /** Собирает и записывает полный index клиента. */
    async combineAndWrite() {
        const result = this.buildClientIndexMap();
        await this.finalizeAndWrite(result);
    }

    /** Собирает и записывает упрощённый index клиента. */
    async combineAndWrightSimple() {
        const result = this.buildSimpleClientIndexMap();
        await this.simpledFinalizeAndWrite(result);
    }

    /** Логгер записи клиента. */
    public get logger() {
        return this._logger;
    }

    /**
     * Записывает выходной файл, если содержимое изменилось.
     * @param filePath путь к файлу
     * @param content содержимое файла
     * @returns результат записи: written или unchanged
     */
    public async writeOutputFile(filePath: string, content: string): Promise<WriteFileIfChangedResult> {
        this.expectedOutputFiles.add(resolveHelper(process.cwd(), filePath));
        const result = await writeFileIfChanged(filePath, content);
        this.writeStats[result] += 1;
        return result;
    }

    /**
     * Регистрирует ожидаемый выходной файл без записи содержимого.
     * @param filePath путь к файлу
     */
    public registerOutputFile(filePath: string): void {
        this.expectedOutputFiles.add(resolveHelper(process.cwd(), filePath));
    }

    /** Возвращает множество ожидаемых выходных файлов. */
    public getExpectedOutputFiles(): Set<string> {
        return this.expectedOutputFiles;
    }

    /** Возвращает список ожидаемых выходных файлов. */
    public getExpectedOutputFilesArray(): string[] {
        return Array.from(this.expectedOutputFiles);
    }

    /** Возвращает статистику записи файлов. */
    public getWriteStats(): { written: number; unchanged: number } {
        return { ...this.writeStats };
    }

    /**
     * Registers a generated file for the post-generation batch ESLint pass.
     *
     * @param filePath - Written file path (absolute or relative to cwd).
     * @param outputRoot - Models or services output directory used to build a narrow tsconfig glob.
     */
    public registerLintTarget(filePath: string, outputRoot: string): void {
        this.lintTargetFiles.add(resolveHelper(process.cwd(), filePath));
        this.lintIncludeGlobs.add(`${outputRoot.replace(/\\/g, '/')}/**/*.ts`);
    }

    /**
     * Returns collected lint targets after all writeClient* calls.
     */
    public getLintTargets(): { files: string[]; includeGlobs: string[] } {
        return {
            files: [...this.lintTargetFiles],
            includeGlobs: [...this.lintIncludeGlobs],
        };
    }

    /** Clears the lint registry after batch ESLint finishes or is skipped. */
    public clearLintTargets(): void {
        this.lintTargetFiles.clear();
        this.lintIncludeGlobs.clear();
    }

    private buildSimpleClientIndexMap(): Map<string, SimpleClientArtifacts> {
        const result: Map<string, SimpleClientArtifacts> = new Map<string, SimpleClientArtifacts>();
        for (const [key, value] of this.config.entries()) {
            for (const item of value) {
                const { outputPaths, templates, excludeCoreServiceFiles, validationLibrary, schemaModels } = item;
                const outputCore = this.getOutputPath(outputPaths?.outputCore, key, 'core');
                const outputModels = this.getOutputPath(outputPaths?.outputModels, key, 'models');
                const outputSchemas = this.getOutputPath(outputPaths?.outputSchemas, key, 'schemas');
                const outputServices = this.getOutputPath(outputPaths?.outputServices, key, 'services');

                const clientIndex = this.ensureSimpleClientIndex(result, key, templates);

                if (!excludeCoreServiceFiles) {
                    const relativePathCore = relativeHelper(key, outputCore);
                    if (!clientIndex.core.includes(relativePathCore)) {
                        clientIndex.core.push(relativePathCore);
                    }

                    const relativeService = relativeHelper(key, outputServices);
                    if (!clientIndex.services.includes(relativeService)) {
                        clientIndex.services.push(relativeService);
                    }
                }

                const relativePathModel = relativeHelper(key, outputModels);
                if (!clientIndex.models.includes(relativePathModel)) {
                    clientIndex.models.push(relativePathModel);
                }

                if (validationLibrary !== ValidationLibrary.NONE && schemaModels.length > 0) {
                    const relativePathSchema = relativeHelper(key, outputSchemas);
                    if (!clientIndex.schemas.includes(relativePathSchema)) {
                        clientIndex.schemas.push(relativePathSchema);
                    }
                }
            }
        }

        return result;
    }

    private buildClientIndexMap(): Map<string, ClientArtifacts> {
        const result: Map<string, ClientArtifacts> = new Map<string, ClientArtifacts>();
        for (const [key, value] of this.config.entries()) {
            for (const item of value) {
                const { outputPaths, client, templates, useUnionTypes, excludeCoreServiceFiles, validationLibrary, schemaModels, modelsMode } = item;
                const outputCore = this.getOutputPath(outputPaths?.outputCore, key, 'core');
                const outputModels = this.getOutputPath(outputPaths?.outputModels, key, 'models');
                const outputSchemas = this.getOutputPath(outputPaths?.outputSchemas, key, 'schemas');
                const outputServices = this.getOutputPath(outputPaths?.outputServices, key, 'services');

                const clientIndex = this.ensureClientIndex(result, key, templates);
                if (!clientIndex.modelsMode) {
                    clientIndex.modelsMode = modelsMode;
                }

                if (!excludeCoreServiceFiles) {
                    const rel = relativeHelper(key, outputCore);
                    if (!clientIndex.core.includes(rel)) {
                        clientIndex.core.push(rel);
                    }

                    const relativeService = `${relativeHelper(key, outputServices)}`;
                    for (const service of client.services) {
                        if (!clientIndex.services.some(s => this.isSomeService(s, service.name, relativeService))) {
                            clientIndex.services.push({
                                name: service.name,
                                package: relativeService,
                            });
                        }
                    }
                }

                const relativePathModel = `${relativeHelper(key, outputModels)}`;
                if (!clientIndex.modelsPackage) {
                    clientIndex.modelsPackage = relativePathModel;
                }
                const relativePathSchema = `${relativeHelper(key, outputSchemas)}`;
                for (const model of client.models) {
                    const modelFinal = {
                        name: model.name,
                        alias: '',
                        path: model.path,
                        package: relativePathModel,
                        enum: model.enum && model.enum.length > 0,
                        useUnionTypes,
                        enums: model.enums && model.enums.length > 0,
                    };

                    if (!clientIndex.models.some(m => this.isSameModel(m, modelFinal))) {
                        clientIndex.models.push(modelFinal);
                    }

                    if (validationLibrary !== ValidationLibrary.NONE && schemaModels.some(schemaModel => schemaModel.name === model.name && schemaModel.path === model.path)) {
                        const schema = { ...modelFinal, package: relativePathSchema };

                        if (!clientIndex.schemas.some(s => this.isSameShema(s, schema))) {
                            clientIndex.schemas.push(schema);
                        }
                    }
                }
            }
        }

        return result;
    }

    private async finalizeAndWrite(result: Map<string, ClientArtifacts>): Promise<void> {
        for (const value of result.values()) {
            value.models = value.models.filter(unique).sort(sortModelByName);
            prepareAlias(value.models);
            value.schemas = value.schemas.filter(unique).sort(sortModelByName);
            prepareAlias(value.schemas);
            await this.writeClientFullIndex(value);
        }
    }

    private async simpledFinalizeAndWrite(result: Map<string, SimpleClientArtifacts>): Promise<void> {
        for (const value of result.values()) {
            await this.writeClientSimpleIndex(value);
        }
    }

    private getOutputPath(output: string | undefined, key: string, fallback: string) {
        return output ? output : resolveHelper(key, fallback);
    }

    private ensureClientIndex(map: Map<string, ClientArtifacts>, key: string, templates: any): ClientArtifacts {
        if (!map.has(key)) {
            map.set(key, {
                templates,
                outputPath: key,
                core: [],
                models: [],
                schemas: [],
                services: [],
                modelsMode: undefined,
                modelsPackage: undefined,
            });
        }

        return map.get(key)!;
    }

    private ensureSimpleClientIndex(map: Map<string, SimpleClientArtifacts>, key: string, templates: any): SimpleClientArtifacts {
        if (!map.has(key)) {
            map.set(key, {
                templates,
                outputPath: key,
                core: [],
                models: [],
                schemas: [],
                services: [],
            });
        }

        return map.get(key)!;
    }

    private isSameModel(a: ExportedModel, b: ExportedModel): boolean {
        return a.name === b.name && a.path === b.path && a.package === b.package && a.enum === b.enum && a.enums === b.enums && a.useUnionTypes === b.useUnionTypes;
    }

    private isSameShema(a: ExportedModel, b: ExportedModel): boolean {
        return a.name === b.name && a.path === b.path && a.package === b.package;
    }

    private isSomeService(a: ExportedService, name: string, pkg: string): boolean {
        return a.name === name && a.package === pkg;
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
