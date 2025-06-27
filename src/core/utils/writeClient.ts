import { HttpClient } from '../types/Enums';
import { IOutput } from '../types/Models';
import type { Client } from '../types/shared/Client.model';
import { relative, resolve } from '../utils/pathHelpers';
import { fileSystem } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { unique } from './unique';
import { writeClientCore } from './writeClientCore';
import { IClientIndex, IModel } from './writeClientIndex';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';

function sortModelByName(a: IModel, b: IModel): number {
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    return 0;
}

function prepareAlias(models: IModel[]) {
    let modelPrevious: IModel | undefined = undefined;
    let index = 1;
    for (const model of models) {
        if (modelPrevious && model.name === modelPrevious.name) {
            model.alias = `${model.name}$${index}`;
            if (!modelPrevious.alias) {
                modelPrevious.alias = `${modelPrevious.name}$${index - 1}`;
            }
            index++;
        } else if (modelPrevious && model.name !== modelPrevious.name) {
            index = 1;
        }
        modelPrevious = model;
    }
}

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
        const result: Map<string, IClientIndex> = new Map<string, IClientIndex>();
        for (const [key, value] of this.options.entries()) {
            for (const item of value) {
                const { exportCore, outputPaths, exportModels, exportSchemas, exportServices, client, templates } = item;
                const outputCore = outputPaths.outputCore ? outputPaths.outputCore : resolve(key, 'core');
                const outputModels = outputPaths.outputModels ? outputPaths.outputModels : resolve(key, 'models');
                const outputSchemas = outputPaths.outputSchemas ? outputPaths.outputSchemas : resolve(key, 'schemas');
                const outputServices = outputPaths.outputServices ? outputPaths.outputServices : resolve(key, 'services');
                let clientIndex = result.get(`${key}`);
                if (!clientIndex) {
                    clientIndex = {
                        templates: templates,
                        outputPath: key,
                        core: [],
                        models: [],
                        schemas: [],
                        services: [],
                    };
                    result.set(`${key}`, clientIndex);
                }
                if (exportCore) {
                    const relativePath = `${relative(key, outputCore)}`;
                    const clientCore = clientIndex.core.find(item => item === relativePath);
                    if (!clientCore) {
                        clientIndex.core.push(relativePath);
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
                            useUnionTypes: item.useUnionTypes,
                            enums: model.enums && model.enums.length > 0,
                        };
                        if (exportModels) {
                            const value = clientIndex.models.find(
                                item =>
                                    item.name === modelFinal.name &&
                                    item.path === modelFinal.path &&
                                    item.package === modelFinal.package &&
                                    item.enum === modelFinal.enum &&
                                    item.enums === modelFinal.enums &&
                                    item.useUnionTypes === modelFinal.useUnionTypes
                            );
                            if (!value) {
                                clientIndex.models.push(modelFinal);
                            }
                        }
                        if (exportSchemas) {
                            const schema = { ...modelFinal, package: relativePathSchema };
                            const indexValue = clientIndex.schemas.find(item => item.name === schema.name && item.path === schema.path && item.package === schema.package);
                            if (!indexValue) {
                                clientIndex.schemas.push(schema);
                            }
                        }
                    }
                }
                if (exportServices) {
                    const relativeService = `${relative(key, outputServices)}`;
                    for (const service of client.services) {
                        const valueIndex = clientIndex.services.find(item => item.name === service.name && item.package === relativeService);
                        if (!valueIndex) {
                            clientIndex.services.push({
                                name: service.name,
                                package: relativeService,
                            });
                        }
                    }
                }
            }
        }
        for (const value of result.values()) {
            value.models = value.models.filter(unique).sort(sortModelByName);
            prepareAlias(value.models);
            value.schemas = value.schemas.filter(unique).sort(sortModelByName);
            prepareAlias(value.schemas);
            await writeClientIndex(value);
        }
    }
}
