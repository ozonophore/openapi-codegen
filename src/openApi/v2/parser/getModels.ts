import type { Model } from '../../../client/interfaces/Model';
import { Context } from '../../../core/Context';
import { getRefFromSchema } from '../../../utils/getRefFromSchema';
import { unique } from '../../../utils/unique';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';

export function getModels(openApi: OpenApi): Model[] {
    const context = Context.getInstance();
    const models: Model[] = [];
    const listOfModelsRef = getRefFromSchema(context, openApi);
    if (listOfModelsRef) {
        for (const modelRef of listOfModelsRef) {
            const definition: any = context.get(modelRef);
            const definitionType = getType(modelRef);
            const model = getModel({ openApi: openApi, definition: definition, isDefinition: true, name: definitionType.base, path: definitionType.path });
            models.push(model);
        }
    }
    return models.filter(unique);
}
