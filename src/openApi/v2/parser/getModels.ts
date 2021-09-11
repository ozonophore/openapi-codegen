import type { Model } from '../../../client/interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';

export function getModels(openApi: OpenApi): Model[] {
    const models: Model[] = [];
    for (const definitionName in openApi.definitions) {
        if (openApi.definitions.hasOwnProperty(definitionName)) {
            const definition = openApi.definitions[definitionName];
            const definitionType = getType(definitionName);
            const model = getModel({ openApi: openApi, definition: definition, isDefinition: true, name: definitionType.base, path: definitionType.path });
            models.push(model);
        }
    }
    return models;
}
