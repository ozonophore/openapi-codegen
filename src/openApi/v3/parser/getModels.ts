import type { Model } from '../../../client/interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';
import { getRefs } from '../../../utils/getRefs';
import { pathToArray } from '../../../utils/pathToArray';

export function getModels(openApi: OpenApi): Model[] {
    const models: Model[] = [];
    if (openApi.components) {
        const refs = getRefs(openApi);
        for (const ref of refs) {
            const path = pathToArray(ref);
            let definition: any = openApi;
            let hadProp = false;
            for (const field of path) {
                if (definition.hasOwnProperty(field)) {
                    definition = definition[field];
                    hadProp = true;
                }
            }
            if (hadProp) {
                const definitionType = getType(ref);
                const model = getModel(openApi, definition, true, definitionType.base, definitionType.path);
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
