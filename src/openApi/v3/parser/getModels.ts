import type { Model } from '../../../client/interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';

export function getModels(openApi: OpenApi): Model[] {
    const models: Model[] = [];
    if (openApi.components) {
        for (const definitionName in openApi.components.schemas) {
            const deepModel = getDeepModel(openApi, openApi.components.schemas, definitionName);
            if (deepModel) {
                models.push(deepModel);
            }
            else if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const definition = openApi.components.schemas[definitionName];
                const definitionType = getType(definitionName);
                const model = getModel(openApi, definition, true, definitionType.base);
                models.push(model);
            }
        }
    }
    return models;
}

function getDeepModel(openApi: OpenApi, schemas: any, definitionName: string) {
    let model: Model = Object.assign(schemas, {}) as Model;

    for (const key of Object.keys(schemas)) {
        if (key === '$schema') {
            const definitionType = getType(definitionName);
            model = getModel(openApi, schemas, true, definitionType.base);
        }
        else if (schemas[key] instanceof Object) {
            getDeepModel(openApi, schemas[key], key);
        }
    }
    
    return model;
}