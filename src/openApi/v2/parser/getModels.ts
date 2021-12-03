import type { Model } from '../../../client/interfaces/Model';
import { unique } from '../../../utils/unique';
import type { OpenApi } from '../interfaces/OpenApi';
import { Parser } from '../Parser';
import { getModel } from './getModel';
import { getType } from './getType';

export function getModels(this: Parser, openApi: OpenApi): Model[] {
    const models: Model[] = [];
    const listOfModelsRef = this.getRefFromSchema(openApi);
    if (listOfModelsRef) {
        for (const modelRef of listOfModelsRef) {
            const definition: any = this.context.get(modelRef);
            const definitionType = getType(modelRef);
            const model = getModel({ openApi: openApi, definition: definition, isDefinition: true, name: definitionType.base, path: definitionType.path });
            models.push(model);
        }
    }
    return models.filter(unique);
}
