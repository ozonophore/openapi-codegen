import { ELogLevel, ELogOutput } from '../common/Enums';
import { Logger } from '../common/Logger';
import { HttpClient } from './types/Enums';
import { IOutput } from './types/Models';
import type { Client } from './types/shared/Client.model';
import { fileSystem } from './utils/fileSystem';
import { relative, resolve } from './utils/pathHelpers';
import { prepareAlias } from './utils/prepareAlias';
import { Templates } from './utils/registerHandlebarTemplates';
import { sortModelByName } from './utils/sortModelByName';
import { unique } from './utils/unique';
import { writeClientCore } from './utils/writeClientCore';
import { IClientIndex, IModel, IService, ISimpleClientIndex } from './utils/writeClientIndex';
import { writeClientIndex } from './utils/writeClientIndex';
import { writeClientModels } from './utils/writeClientModels';
import { writeClientSchemas } from './utils/writeClientSchemas';
import { writeClientServices } from './utils/writeClientServices';

/**
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param outputPaths The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core client classes
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 * @param clean: Clean a directory before generation
 * @param request: Path to custom request file
 * @param useCancelableRequest Use cancelable request type.
 * @param useSeparatedIndexes Использовать отдельные index файлы для ядра, моделей, схем и сервисов.
 */
interface IWriteClient {
    client: Client;
    templates: Templates;
    outputPaths: IOutput;
    httpClient: HttpClient;
    useOptions: boolean;
    useUnionTypes: boolean;
    exportCore: boolean;
    exportServices: boolean;
    exportModels: boolean;
    exportSchemas: boolean;
    clean: boolean;
    request?: string;
    useCancelableRequest?: boolean;
    useSeparatedIndexes?: boolean;
}

/**
 * @param client Client object with all the models, services, etc.
 * @param templates The loaded handlebar templates
 * @param outputPaths Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 */
export interface IWriteClientIndex {
    client: Client;
    templates: Templates;
    outputPaths: IOutput;
    useUnionTypes: boolean;
    exportCore: boolean;
    exportServices: boolean;
    exportModels: boolean;
    exportSchemas: boolean;
}

/**
 * The client which is writing all items and keep the parameters to write index file
 */
export class WriteClient {
    private options: Map<string, IWriteClientIndex[]> = new Map();
    private _logger: Logger;

    constructor() {
        this._logger = new Logger({
            level: ELogLevel.ERROR,
            instanceId: 'client',
            logOutput: ELogOutput.CONSOLE,
        });
    }

    /**
     * Write our OpenAPI client, using the given templates at the given output
     * @param client Client object with all the models, services, etc.
     * @param templates Templates wrapper with all loaded Handlebars templates
     * @param outputPaths A set of parameters with paths for generating main sections (folders)
     * @param httpClient The selected httpClient (fetch, xhr or node)
     * @param useOptions Use options or arguments functions
     * @param useUnionTypes Use union types instead of enums
     * @param exportCore: Generate core client classes
     * @param exportServices: Generate services
     * @param exportModels: Generate models
     * @param exportSchemas: Generate schemas
     * @param clean: Clean a directory before generation
     * @param request: Path to custom request file
     * @param useCancelableRequest Use cancelable request type.
     */
    async writeClient(options: IWriteClient): Promise<void> {
        const { client, templates, outputPaths, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, request, useCancelableRequest = false } = options;

        if (exportCore) {
            await fileSystem.mkdir(outputPaths.outputCore);
            await writeClientCore({ client, templates, outputCorePath: outputPaths.outputCore, httpClient, request, useCancelableRequest });
        }

        if (exportServices) {
            const { outputCore, outputServices, outputModels } = outputPaths;
            await fileSystem.mkdir(outputPaths.outputServices);
            await writeClientServices({
                services: client.services,
                templates,
                outputPaths: {
                    outputServices,
                    outputCore: exportCore ? `${relative(outputServices, outputCore)}` : '../core/',
                    outputModels: exportModels ? `${relative(outputServices, outputModels)}` : '../models/',
                },
                httpClient,
                useUnionTypes,
                useOptions,
                useCancelableRequest,
            });
        }

        if (exportSchemas) {
            await fileSystem.mkdir(outputPaths.outputSchemas);
            await writeClientSchemas({
                models: client.models,
                templates,
                outputSchemasPath: outputPaths.outputSchemas,
                httpClient,
                useUnionTypes,
            });
        }

        if (exportModels) {
            await fileSystem.mkdir(outputPaths.outputModels);
            await writeClientModels({
                models: client.models,
                templates,
                outputModelsPath: outputPaths.outputModels,
                httpClient,
                useUnionTypes,
            });
        }

        // TODO: Возможно лучшее место для записи отдельных index файлов!
        if (exportCore || exportServices || exportSchemas || exportModels) {
            await fileSystem.mkdir(outputPaths.output);
            await this.writeClientIndex({
                client,
                templates,
                outputPaths,
                useUnionTypes,
                exportCore,
                exportServices,
                exportModels,
                exportSchemas,
            });
        }
    }

    /**
     * Method keeps all options that is need to create index file
     * @param options
     */
    async writeClientIndex(options: IWriteClientIndex): Promise<void> {
        const { outputPaths } = options;
        const values = this.options.get(outputPaths.output);
        if (values) {
            values.push(options);
        } else {
            this.options.set(outputPaths.output, Array.of(options));
        }
    }

    async combineAndWrite() {
        const result = this.buildClientIndexMap();
        await this.finalizeAndWrite(result);
    }

    async combineAndWrightSimple() {
        const result = this.buildSimpleClientIndexMap();
        console.log({ result });
    //     await this.finalizeAndWright(result);
    }

    public get logger() {
        return this._logger;
    }

    private buildSimpleClientIndexMap(): Map<string, ISimpleClientIndex> {
        const result: Map<string, ISimpleClientIndex> = new Map<string, ISimpleClientIndex>();
        for (const [key, value] of this.options.entries()) {
            for (const item of value) {
                const { exportCore, outputPaths, exportModels, exportSchemas, exportServices, templates } = item;
                const outputCore = this.getOutputPath(outputPaths?.outputCore, key, 'core');
                const outputModels = this.getOutputPath(outputPaths?.outputModels, key, 'models');
                const outputSchemas = this.getOutputPath(outputPaths?.outputSchemas, key, 'schemas');
                const outputServices = this.getOutputPath(outputPaths?.outputServices, key, 'services');
                
                const clientIndex = this.ensureSimpleClientIndex(result, key, templates);

                if (exportCore) {
                    const relativePathCore = relative(key, outputCore);
                    if (!clientIndex.core.includes(relativePathCore)) {
                        clientIndex.core.push(relativePathCore);
                    }
                }

                if (exportModels) {
                    const relativePathModel = relative(key, outputModels);
                    if (!clientIndex.models.includes(relativePathModel)) {
                        clientIndex.models.push(relativePathModel);
                    }
                }

                if (exportSchemas) {
                    const relativePathSchema = relative(key, outputSchemas);
                    if (!clientIndex.schemas.includes(relativePathSchema)) {
                        clientIndex.schemas.push(relativePathSchema);
                    }
                }

                if (exportServices) {
                    const relativeService = relative(key, outputServices);
                    if (!clientIndex.services.includes(relativeService)) {
                        clientIndex.services.push(relativeService);
                    }
                }
            }
        }

        return result;
    }

    private buildClientIndexMap(): Map<string, IClientIndex> {
        const result: Map<string, IClientIndex> = new Map<string, IClientIndex>();
        for (const [key, value] of this.options.entries()) {
            for (const item of value) {
                const { exportCore, outputPaths, exportModels, exportSchemas, exportServices, client, templates, useUnionTypes } = item;
                const outputCore = this.getOutputPath(outputPaths?.outputCore, key, 'core');
                const outputModels = this.getOutputPath(outputPaths?.outputModels, key, 'models');
                const outputSchemas = this.getOutputPath(outputPaths?.outputSchemas, key, 'schemas');
                const outputServices = this.getOutputPath(outputPaths?.outputServices, key, 'services');

                const clientIndex = this.ensureClientIndex(result, key, templates);

                if (exportCore) {
                    const rel = relative(key, outputCore);
                    if (!clientIndex.core.includes(rel)) {
                        clientIndex.core.push(rel);
                    }
                }

                if (exportModels || exportSchemas) {
                    const relativePathModel = `${relative(key, outputModels)}`;
                    const relativePathSchema = `${relative(key, outputSchemas)}`;
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

                        if (exportModels && clientIndex.models.some(m => this.isSameModel(m, modelFinal))) {
                            clientIndex.models.push(modelFinal);
                        }

                        if (exportSchemas) {
                            const schema = {...modelFinal, package: relativePathSchema};

                            if (!clientIndex.schemas.some(s => this.isSameShema(s, schema))) {
                                clientIndex.schemas.push(schema);
                            }
                        }
                    }
                }

                if (exportServices) {
                    const relativeService = `${relative(key, outputServices)}`;
                    for (const service of client.services) {
                        if (!clientIndex.services.some(s => this.isSomeService(s, service.name, relativeService))) {
                            clientIndex.services.push({
                                name: service.name,
                                package: relativeService,
                            })
                        }
                    }
                }
            }
        }

        return result;
    }

    private async finalizeAndWrite(result: Map<string, IClientIndex>): Promise<void> {
        for (const value of result.values()) {
            value.models = value.models.filter(unique).sort(sortModelByName);
            prepareAlias(value.models);
            value.schemas = value.schemas.filter(unique).sort(sortModelByName);
            prepareAlias(value.schemas);
            await writeClientIndex(value);
        }
    }

    private getOutputPath(output: string | undefined, key: string, fallback: string) {
        return output ? output : resolve(key, fallback);
    }

    private ensureClientIndex(
        map: Map<string, IClientIndex>,
        key: string,
        templates: any
    ): IClientIndex {
        if (!map.has(key)) {
            map.set(key, {
                templates,
                outputPath: key,
                core: [],
                models: [],
                schemas: [],
                services: [],
            })
        }

        return map.get(key)!;
    }

    private ensureSimpleClientIndex(
        map: Map<string, ISimpleClientIndex>,
        key: string,
        templates: any
    ): ISimpleClientIndex {
        if (!map.has(key)) {
            map.set(key, {
                templates,
                outputPath: key,
                core: [],
                models: [],
                schemas: [],
                services: [],
            })
        }

        return map.get(key)!;
    }

    private isSameModel(a: IModel, b: IModel): boolean {
        return (
            a.name === b.name &&
            a.path === b.path &&
            a.package === b.package &&
            a.enum === b.enum &&
            a.enums === b.enums &&
            a.useUnionTypes === b.useUnionTypes
        );
    }

    private isSameShema(a: IModel, b: IModel): boolean {
        return a.name === b.name && a.path === b.path && a.package === b.package
    }

    private isSomeService(a: IService, name: string, pkg: string): boolean {
        return a.name === name && a.package === pkg;
    }
}
