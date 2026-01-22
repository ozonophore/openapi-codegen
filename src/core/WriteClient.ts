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
import { HttpClient } from './types/enums/HttpClient.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
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

/**
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param outputPaths The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param excludeCoreServiceFiles The generation of the core and services is excluded
 * @param request: Path to custom request file
 * @param useCancelableRequest Use cancelable request type.
 * @param useSeparatedIndexes Use separate index files for the core, models, schemas, and services
 * @param validationLibrary Validation library to use for schema validation
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
    useCancelableRequest?: boolean;
    useSeparatedIndexes?: boolean;
    validationLibrary?: ValidationLibrary;
};

type TAPIClientGeneratorConfig = Omit<TWriteClientProps, 'httpClient' | 'useOptions' | 'request' | 'useCancelableRequest' | 'useSeparatedIndexes'>;

/**
 * The client which is writing all items and keep the parameters to write index file
 */
export class WriteClient {
    private config: Map<string, TAPIClientGeneratorConfig[]> = new Map();
    private _logger: Logger;

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
     * Write our OpenAPI client, using the given templates at the given output
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
            useCancelableRequest = false,
            useSeparatedIndexes = false,
            validationLibrary = ValidationLibrary.NONE,
        } = options;

        if (!excludeCoreServiceFiles) {
            await fileSystemHelpers.mkdir(outputPaths.outputCore);
            await this.writeClientCore({ client, templates, outputCorePath: outputPaths.outputCore, httpClient, request, useCancelableRequest });
            await this.writeClientCoreIndex({
                templates,
                outputCorePath: outputPaths.outputCore,
                useCancelableRequest,
                useSeparatedIndexes,
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
            });
        }

        /**
         * TODO: Нужно собирать импорты из всех вложенных моделей (link, properties в composition и т.д.) и передавать их в шаблон.
         * Это делается в writeClientSchemas или в парсере моделей.
         */
        if (validationLibrary !== ValidationLibrary.NONE) {
            await fileSystemHelpers.mkdir(outputPaths.outputSchemas);
            await this.writeClientSchemas({
                models: client.models,
                templates,
                outputSchemasPath: outputPaths.outputSchemas,
                httpClient,
                useUnionTypes,
                validationLibrary,
            });
            await this.writeClientSchemasIndex({
                models: client.models,
                templates,
                outputSchemasPath: outputPaths.outputSchemas,
                useSeparatedIndexes,
            });
        }

        await fileSystemHelpers.mkdir(outputPaths.outputModels);
        await this.writeClientModels({
            models: client.models,
            templates,
            outputModelsPath: outputPaths.outputModels,
            httpClient,
            useUnionTypes,
        });
        await this.writeClientModelsIndex({
            models: client.models,
            templates,
            outputModelsPath: outputPaths.outputModels,
            useSeparatedIndexes,
        });

        await fileSystemHelpers.mkdir(outputPaths.output);
        this.buildClientGeneratorConfigMap({
            client,
            templates,
            outputPaths,
            useUnionTypes,
            excludeCoreServiceFiles,
            validationLibrary,
        });
    }

    /**
     * Method keeps all options that is need to create index file
     * @param config
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

    async combineAndWrite() {
        const result = this.buildClientIndexMap();
        await this.finalizeAndWrite(result);
    }

    async combineAndWrightSimple() {
        const result = this.buildSimpleClientIndexMap();
        await this.simpledFinalizeAndWrite(result);
    }

    public get logger() {
        return this._logger;
    }

    private buildSimpleClientIndexMap(): Map<string, SimpleClientArtifacts> {
        const result: Map<string, SimpleClientArtifacts> = new Map<string, SimpleClientArtifacts>();
        for (const [key, value] of this.config.entries()) {
            for (const item of value) {
                const { outputPaths, templates, excludeCoreServiceFiles, validationLibrary } = item;
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

                if (validationLibrary !== ValidationLibrary.NONE) {
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
                const { outputPaths, client, templates, useUnionTypes, excludeCoreServiceFiles, validationLibrary } = item;
                const outputCore = this.getOutputPath(outputPaths?.outputCore, key, 'core');
                const outputModels = this.getOutputPath(outputPaths?.outputModels, key, 'models');
                const outputSchemas = this.getOutputPath(outputPaths?.outputSchemas, key, 'schemas');
                const outputServices = this.getOutputPath(outputPaths?.outputServices, key, 'services');

                const clientIndex = this.ensureClientIndex(result, key, templates);

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

                    if (validationLibrary !== ValidationLibrary.NONE) {
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

    public writeClientCore = writeClientCore;
    public writeClientCoreIndex = writeClientCoreIndex;
    public writeClientFullIndex = writeClientFullIndex;
    public writeClientModels = writeClientModels;
    public writeClientModelsIndex = writeClientModelsIndex;
    public writeClientSchemas = writeClientSchemas;
    public writeClientSchemasIndex = writeClientSchemasIndex;
    public writeClientServices = writeClientServices;
    public writeClientServicesIndex = writeClientServicesIndex;
    public writeClientSimpleIndex = writeClientSimpleIndex;
    public writeClientExecutor = writeClientExecutor;
}
