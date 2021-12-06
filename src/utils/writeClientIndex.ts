import { resolve } from 'path';

import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';

/**
 * @param name The name of the model
 * @param alias The alias of the model(when there are several similar models in the one specification)
 * @param path The name of the file witch contains this model
 * @param package The relative location of this service
 * @param enum Then flag for mark an enum
 * @param useUnionTypes Use union types instead of enums
 * @param enums Then flag for mark an enums
 */
export interface IModel {
    name: string;
    alias: string;
    path: string;
    package: string;
    enum: boolean;
    useUnionTypes: boolean;
    enums: boolean;
}

/**
 * @param name The name of the service
 * @param package The relative location of this service
 */
export interface IService {
    name: string;
    package: string;
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
interface IWriteClientIndex {
    templates: Templates;
    outputPath: string;
    core: Array<string>;
    models: Array<IModel>;
    schemas: Array<IModel>;
    services: Array<IService>;
}

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 */
export async function writeClientIndex(options: IWriteClientIndex): Promise<void> {
    const { templates, outputPath, core, models, schemas, services } = options;
    await writeFile(
        resolve(outputPath, 'index.ts'),
        templates.index({
            core,
            models,
            schemas,
            services,
        })
    );
}
