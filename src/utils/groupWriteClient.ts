import { resolve } from 'path';

import { relative } from './path';
import { IWriteClient } from './writeClient';
import { IModel, IService } from './writeClientIndex';

interface IWriteClientOptions {
    core: Array<string>;
    models: Array<IModel>;
    schemas: Array<IModel>;
    services: Array<IService>;
}

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
 * Preparation models to write in the template
 */
export function groupWriteClient(writeClients: Array<IWriteClient>): IWriteClientOptions {
    const initArray = {
        core: new Array<string>(),
        models: new Array<IModel>(),
        schemas: Array<IModel>(),
        services: new Array<IService>(),
    };
    for (const writeClient of writeClients) {
        const { exportCore, output, exportModels, exportSchemas, exportServices } = writeClient;
        const outputPath = resolve(process.cwd(), output.output);
        if (exportCore) {
            const outputPathCore = output.outputCore ? resolve(process.cwd(), output.outputCore) : resolve(outputPath, 'core');
            const relativePath = `${relative(outputPath, outputPathCore)}/`;
            const clientCore = initArray.core.find(item => item === relativePath);
            if (!clientCore) {
                initArray.core.push(relativePath);
            }
        }
        if (exportModels || exportSchemas) {
            const outputPathModel = output.outputModels ? resolve(process.cwd(), output.outputModels) : resolve(outputPath, 'models');
            const outputPathSchema = output.outputModels ? resolve(process.cwd(), output.outputModels) : resolve(outputPath, 'schemas');
            const relativePathModel = `${relative(outputPath, outputPathModel)}/`;
            const relativePathSchema = `${relative(outputPath, outputPathSchema)}/`;
            for (const model of writeClient.client.models) {
                const modelFinal = {
                    name: model.name,
                    alias: '',
                    path: model.path,
                    package: relativePathModel,
                    enum: model.enum && model.enum.length > 0,
                    useUnionTypes: writeClient.useUnionTypes,
                    enums: model.enums && model.enums.length > 0,
                };
                if (exportModels) {
                    const value = initArray.models.find(
                        item =>
                            item.name === modelFinal.name &&
                            item.path === modelFinal.path &&
                            item.package === modelFinal.package &&
                            item.enum === modelFinal.enum &&
                            item.enums === modelFinal.enums &&
                            item.useUnionTypes === modelFinal.useUnionTypes
                    );
                    if (!value) {
                        initArray.models.push(modelFinal);
                    }
                }
                if (exportSchemas) {
                    const schema = { ...modelFinal, package: relativePathSchema };
                    const value = initArray.schemas.find(item => item.name === schema.name && item.path === schema.path && item.package === schema.package);
                    if (!value) {
                        initArray.schemas.push(schema);
                    }
                }
            }
        }
        if (exportServices) {
            const outputPathService = output.outputServices ? resolve(process.cwd(), output.outputServices) : resolve(outputPath, 'services');
            const relativeService = `${relative(outputPath, outputPathService)}/`;
            for (const service of writeClient.client.services) {
                const value = initArray.services.find(item => item.name === service.name && item.package === relativeService);
                if (!value) {
                    initArray.services.push({
                        name: service.name,
                        package: relativeService,
                    });
                }
            }
        }
    }
    initArray.models = initArray.models.sort(sortModelByName);
    prepareAlias(initArray.models);
    initArray.schemas = initArray.schemas.sort(sortModelByName);
    prepareAlias(initArray.schemas);
    return initArray;
}
