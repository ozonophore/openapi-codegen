import { ExportedModel } from "../types/base/ExportedModel.model";

export function prepareAlias(models: ExportedModel[]) {
    let modelPrevious: ExportedModel | undefined = undefined;
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