import type { Model } from '../../../client/interfaces/Model';
import { Context } from '../../../core/Context';
import { join, relative } from '../../../core/path';
import { getRefFromSchema } from '../../../utils/getRefFromSchema';
import { sortModelsByName } from '../../../utils/sortModelsByName';
import { unique } from '../../../utils/unique';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';

export function getModels(context: Context, openApi: OpenApi): Model[] {
    let models: Model[] = [];
    const listOfModelsRef = getRefFromSchema(context, openApi);
    if (listOfModelsRef) {
        for (const modelRef of listOfModelsRef) {
            const definition: any = context.get(modelRef);
            const definitionType = getType(modelRef);
            const model = getModel({
                openApi: openApi,
                definition: definition,
                isDefinition: true,
                name: definitionType.base,
                path: definitionType.path,
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
                if (importModel.length > 0) {
                    return Object.assign(imprt, {
                        alias: importModel[0].alias,
                        path: join(relative(model.path, importModel[0].path), imprt.name),
                    });
                }
                return imprt;
            });
        });
    }
    return models.filter(unique);
}
