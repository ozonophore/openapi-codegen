import type { Model } from '../../../types/shared/Model.model';
import { getModelNameWithPrefix } from '../../../utils/getModelNameWithPrefix';
import { getRefFromSchema } from '../../../utils/getRefFromSchema';
import { resolveModelImports, setDuplicateModelAliases } from '../../../utils/modelHelpers';
import { sortModelsByName } from '../../../utils/sortModelsByName';
import { unique } from '../../../utils/unique';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';

export function getModels(this: Parser, openApi: OpenApi): Model[] {
    let models: Model[] = [];
    const listOfModelsRef = getRefFromSchema(this.context, openApi);
    if (listOfModelsRef) {
        for (const modelRef of listOfModelsRef) {
            const definition: any = this.context.get(modelRef);
            const definitionType = this.getType(modelRef, '');
            const model = this.getModel({
                openApi: openApi,
                definition: definition,
                isDefinition: true,
                name: getModelNameWithPrefix(definitionType.base, definition, this.context.prefix),
                path: definitionType.path,
                parentRef: modelRef,
            });
            models.push(model);
        }
        models = sortModelsByName(models.filter(unique));
        setDuplicateModelAliases(models);
        resolveModelImports(models, this.context.output.outputModels);
    }
    return models.filter(unique);
}
