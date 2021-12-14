import type { Client } from '../client/interfaces/Client';
import { relative, resolve } from '../core/path';
import { HttpClient } from '../HttpClient';
import { mkdir } from './fileSystem';
import { isSubDirectory } from './isSubdirectory';
import { IOutput } from './output';
import { Templates } from './registerHandlebarTemplates';
import { writeClientCore } from './writeClientCore';
import { IClientIndex, IModel, IService } from './writeClientIndex';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';
import { unique } from './unique';

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
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core client classes
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 * @param clean: Clean a directory before generation
 * @param request: Path to custom request file
 */
interface IWriteClient {
    client: Client;
    templates: Templates;
    output: IOutput;
    httpClient: HttpClient;
    useOptions: boolean;
    useUnionTypes: boolean;
    exportCore: boolean;
    exportServices: boolean;
    exportModels: boolean;
    exportSchemas: boolean;
    clean: boolean;
    request?: string;
}

/**
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 */
export interface IWriteClientIndex {
    client: Client;
    templates: Templates;
    output: IOutput;
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
     * @param output The relative location of the output directory
     * @param httpClient The selected httpClient (fetch, xhr or node)
     * @param useOptions Use options or arguments functions
     * @param useUnionTypes Use union types instead of enums
     * @param exportCore: Generate core client classes
     * @param exportServices: Generate services
     * @param exportModels: Generate models
     * @param exportSchemas: Generate schemas
     * @param clean: Clean a directory before generation
     * @param request: Path to custom request file
     */
    async writeClient(options: IWriteClient): Promise<void> {
        const { client, templates, output, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, request } = options;
        const outputPath = resolve(process.cwd(), output.output);
        const outputPathCore = output.outputCore ? resolve(process.cwd(), output.outputCore) : resolve(outputPath, 'core');
        const outputPathModels = output.outputModels ? resolve(process.cwd(), output.outputModels) : resolve(outputPath, 'models');
        const outputPathSchemas = output.outputSchemas ? resolve(process.cwd(), output.outputSchemas) : resolve(outputPath, 'schemas');
        const outputPathServices = output.outputServices ? resolve(process.cwd(), output.outputServices) : resolve(outputPath, 'services');

        if (!isSubDirectory(process.cwd(), output.output)) {
            throw new Error(`Output folder is not a subdirectory of the current working directory`);
        }
        if (output.outputCore && !isSubDirectory(process.cwd(), output.outputCore)) {
            throw new Error(`Output folder(core) is not a subdirectory of the current working directory`);
        }
        if (output.outputSchemas && !isSubDirectory(process.cwd(), output.outputSchemas)) {
            throw new Error(`Output folder(schemas) is not a subdirectory of the current working directory`);
        }
        if (output.outputModels && !isSubDirectory(process.cwd(), output.outputModels)) {
            throw new Error(`Output folder(models) is not a subdirectory of the current working directory`);
        }
        if (output.outputServices && !isSubDirectory(process.cwd(), output.outputServices)) {
            throw new Error(`Output folder(services) is not a subdirectory of the current working directory`);
        }

        if (exportCore) {
            await mkdir(outputPathCore);
            await writeClientCore({ client, templates, outputPath: outputPathCore, httpClient, request });
        }

        if (exportServices) {
            await mkdir(outputPathServices);
            await writeClientServices({
                services: client.services,
                templates,
                outputPath: outputPathServices,
                httpClient,
                useUnionTypes,
                useOptions,
                useCustomRequest: !!request,
                outputModels: exportModels ? `${relative(outputPathServices, outputPathModels)}/` : '../models/',
                outputCore: exportCore ? `${relative(outputPathServices, outputPathCore)}/` : '../core/',
            });
        }

        if (exportSchemas) {
            await mkdir(outputPathSchemas);
            await writeClientSchemas({
                models: client.models,
                templates,
                outputPath: outputPathSchemas,
                httpClient,
                useUnionTypes,
            });
        }

        if (exportModels) {
            await mkdir(outputPathModels);
            await writeClientModels({
                models: client.models,
                templates,
                outputPath: outputPathModels,
                httpClient,
                useUnionTypes,
            });
        }

        if (exportCore || exportServices || exportSchemas || exportModels) {
            await mkdir(outputPath);
            await this.writeClientIndex({
                client,
                templates,
                output: {
                    output: outputPath,
                    outputCore: outputPathCore,
                    outputServices: outputPathServices,
                    outputModels: outputPathModels,
                    outputSchemas: outputPathSchemas,
                },
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
        const { output } = options;
        const values = this.options.get(output.output);
        if (values) {
            values.push(options);
        } else {
            this.options.set(output.output, Array.of(options));
        }
    }

    async combineAndWrite() {
        const result: Map<string, IClientIndex> = new Map<string, IClientIndex>();
        for (const [key, value] of this.options.entries()) {
            for (const item of value) {
                const { exportCore, output, exportModels, exportSchemas, exportServices, client, templates } = item;
                const outputCore = output.outputCore ? resolve(process.cwd(), output.outputCore) : resolve(key, 'core');
                const outputModels = output.outputModels ? resolve(process.cwd(), output.outputModels) : resolve(key, 'models');
                const outputSchemas = output.outputSchemas ? resolve(process.cwd(), output.outputSchemas) : resolve(key, 'schemas');
                const outputServices = output.outputServices ? resolve(process.cwd(), output.outputServices) : resolve(key, 'services');
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
                    const relativePath = `${relative(key, outputCore)}/`;
                    const clientCore = clientIndex.core.find(item => item === relativePath);
                    if (!clientCore) {
                        clientIndex.core.push(relativePath);
                    }
                }
                if (exportModels || exportSchemas) {
                    const relativePathModel = `${relative(key, outputModels)}/`;
                    const relativePathSchema = `${relative(key, outputSchemas)}/`;
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
                    const relativeService = `${relative(key, outputServices)}/`;
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
