import { IModel } from "./writeClientIndex";

/**
 * Function for creating aliases for names
 * @param models Array of models
 */
export function prepareAlias(models: IModel[]) {
    let modelPrevious: IModel | undefined = undefined;
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