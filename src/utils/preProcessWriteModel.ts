import { Import } from '../client/interfaces/Import';
import type { Model } from '../client/interfaces/Model';
import { getRelativeModelImportPath } from './getRelativeModelImportPath';
import { getRelativeModelPath } from './getRelativeModelPath';

export function preProcessWriteModelImports(model: Model, outputPath: string): Import[] {
    return model?.imports?.map(item => {
        const newItem = {
            ...item,
            path: getRelativeModelImportPath(outputPath, item.path, model?.path),
        };

        return newItem;
    });
}

export function preProcessWriteModelPath(model: Model, outputPath: string): string {
    return getRelativeModelPath(outputPath, model?.path);
}

export function preProcessWriteModel(model: Model, outputPath: string): Model {
    const newModel: Model = {
        ...model,
        path: preProcessWriteModelPath(model, outputPath),
    };

    return {
        ...newModel,
        imports: preProcessWriteModelImports(newModel, outputPath),
    };
}
