import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { mkdir, rmdir } from './fileSystem';
import { isSubDirectory } from './isSubdirectory';
import { Templates } from './registerHandlebarTemplates';
import { writeClientCore } from './writeClientCore';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';
import { relative } from './path';

/**
 * @param output The relative location of the output directory(or index)
 * @param outputCore The relative location of the output directory for core
 * @param outputServices The relative location of the output directory for services
 * @param outputModels The relative location of the output directory for models
 * @param outputSchemas The relative location of the output directory for schemas
 */
export interface IOutput {
    output: string;
    outputCore?: string;
    outputServices?: string;
    outputModels?: string;
    outputSchemas?: string;
}

/**
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param output The model of the output directories
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
export interface IWriteClient {
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
 * Write our OpenAPI client, using the given templates at the given output
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param output The object of the output directories
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
export async function writeClient(options: IWriteClient): Promise<void> {
    const { client, templates, output, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, clean, request } = options;
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
        if (clean) {
            await rmdir(outputPathCore);
        }
        await mkdir(outputPathCore);
        await writeClientCore({ client, templates, outputPath: outputPathCore, httpClient, request });
    }

    if (exportServices) {
        if (clean) {
            await rmdir(outputPathServices);
        }
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
        if (clean) {
            await rmdir(outputPathSchemas);
        }
        await mkdir(outputPathSchemas);
        await writeClientSchemas({ models: client.models, templates, outputPath: outputPathSchemas, httpClient, useUnionTypes });
    }

    if (exportModels) {
        if (clean) {
            await rmdir(outputPathModels);
        }
        await mkdir(outputPathModels);
        await writeClientModels({ models: client.models, templates, outputPath: outputPathModels, httpClient, useUnionTypes });
    }
}
