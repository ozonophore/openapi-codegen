import type { Model } from '../../../client/interfaces/Model';
import { join, relative } from '../../../core/path';
import { getRefFromSchema } from '../../../utils/getRefFromSchema';
import { getRelativeModelImportPath } from '../../../utils/getRelativeModelImportPath';
import { getRelativeModelPath } from '../../../utils/getRelativeModelPath';
import { sortModelsByName } from '../../../utils/sortModelsByName';
import { unique } from '../../../utils/unique';
import type { OpenApi } from '../interfaces/OpenApi';
import { Parser } from '../Parser';

export function getModels(this: Parser, openApi: OpenApi): Model[] {
    let models: Model[] = [];
    const listOfModelsRef = getRefFromSchema(this.context, openApi);
    if (listOfModelsRef) {
        for (const modelRef of listOfModelsRef) {
            const definition: any = this.context.get(modelRef);
            const definitionType = this.getType(modelRef, '');
            const modelPath = getRelativeModelPath(this.context.output?.outputModels, definitionType.path);
            const model = this.getModel({
                openApi: openApi,
                definition: definition,
                isDefinition: true,
                name: definitionType.base,
                path: modelPath,
                parentRef: modelRef,
            });
            models.push(model);
        }
        models = sortModelsByName(models.filter(unique));
        let previous: Model;
        let index = 1;
        models.forEach(model => {
            if (previous && previous.name === model.name) {
                if (index === 1) {
                    previous.alias = `${model.name}$${index}`;
                    index++;
                }
                model.alias = `${model.name}$${index}`;
                index++;
            } else {
                model.alias = '';
                index = 1;
            }
            previous = model;
        });
        models.forEach(model => {
            model.imports = model.imports.map(imprt => {
                const importModel = models.filter(value => `${value.path}${value.name}` === imprt.path && value.name === imprt.name);
                const importAlias = importModel.length > 0 ? importModel[0].alias : imprt?.alias;
                const importPath = importModel.length > 0 ? join(relative(model.path, importModel[0].path), imprt.name) : imprt.path;
                return Object.assign(imprt, {
                    alias: importAlias,
                    path: getRelativeModelImportPath(this.context.output?.outputModels, importPath, model.path),
                });
            });
        });
    }
    return models.filter(unique);
}
