import type { Model } from '../../../types/shared/Model.model';
import { isSchemaRegistryPointer } from '../../../utils/isSchemaRegistryPointer';
import { resolveModelImports, setDuplicateModelAliases } from '../../../utils/modelHelpers';
import { parseRef } from '../../../utils/parseRef';
import { sortModelsByName } from '../../../utils/sortModelsByName';
import { unique } from '../../../utils/unique';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';

export function getModels(this: Parser, openApi: OpenApi): Model[] {
    let models: Model[] = [];
    const listOfModelsRef = this.context.getAllCanonicalRefs();
    if (listOfModelsRef) {
        for (const modelRef of listOfModelsRef) {
            if (!isSchemaRegistryPointer(parseRef(modelRef).fragment)) {
                continue;
            }
            const definition: any = this.context.get(modelRef);
            const definitionType = this.getType(modelRef, '');
            const model = this.getModel({
                openApi: openApi,
                definition: definition,
                isDefinition: true,
                name: definitionType.base,
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
