import path from 'path';

import { dirNameHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import type { Model } from '../types/shared/Model.model';

/**
 * Assigns alias to models with the same name.
 * Modifies objects of in-place models and returns an array.
 *
 * Example: if there are two models with name="Pet", the following will be assigned:
 * - first: alias="Pet$1"
 * - second: alias="Pet$2"
 *
 * @param models - an array of models sorted by name
 * @returns the same array of models (modified)
 */
export function setDuplicateModelAliases(models: Model[]): Model[] {
    let previous: Model | undefined;
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
    return models;
}

/**
 * Adjusts the imports fields of the models to relative paths and correct aliases,
 * based on the outputModelsDir directory.
 *
 * Logic:
 * - searches for the target model by name + path;
 * - if found, calculates the relative path between files and substitutes;
 * - updates alias (if it is set for the target model) and path in the import object.
 *
 * @param models - array of models
 * @param outputModelsDir - the directory where the models are generated (this.context.output.outputModels)
 * @returns the same array of models (modified)
 */
export function resolveModelImports(models: Model[], outputModelsDir: string): Model[] {
    models.forEach(model => {
        model.imports = model.imports.map(imprt => {
            const importModel = models.find(value => {
                const normalizedPath = !value.path.startsWith('./') ? `./${value.path}` : value.path;
                return normalizedPath === imprt.path && value.name === imprt.name;
            });
            const importAlias = importModel?.alias ?? imprt.alias;
            let importPath = imprt.path;

            if (importModel) {
                const fromDir = dirNameHelper(resolveHelper(outputModelsDir, model.path));
                const toDir = dirNameHelper(resolveHelper(outputModelsDir, importModel.path));
                const file = path.basename(importModel.path);

                const relativePath = relativeHelper(fromDir, toDir);
                if (relativePath === '') {
                    importPath = `./${file}`;
                } else if (relativePath.startsWith('./')) {
                    importPath = `${relativePath}${file}`
                } else {
                    importPath =  `${relativePath}/${file}`;
                }
            }
            return Object.assign(imprt, {
                alias: importAlias,
                path: importPath,
            });
        });
    });
    return models;
}
