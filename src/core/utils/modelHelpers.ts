import path from 'path';

import { dirNameHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import type { Import } from '../types/shared/Import.model';
import type { Model } from '../types/shared/Model.model';

type AliasAssignable = {
    name: string;
    alias: string;
};

/**
 * Назначает различающие алиасы, когда несколько элементов имеют одно имя.
 * Первое вхождение сохраняет имя без алиаса; следующие получают $2, $3 и т.д.
 * @param items массив элементов с полями name и alias
 * @returns тот же массив с обновлёнными алиасами
 */
export const assignDuplicateAliases = <T extends AliasAssignable>(items: T[]): T[] => {
    const nameCounts = new Map<string, number>();
    items.forEach(item => {
        nameCounts.set(item.name, (nameCounts.get(item.name) ?? 0) + 1);
    });

    const nameIndex = new Map<string, number>();
    items.forEach(item => {
        const count = nameCounts.get(item.name) ?? 1;
        if (count <= 1) {
            item.alias = '';
            return;
        }

        const index = (nameIndex.get(item.name) ?? 0) + 1;
        nameIndex.set(item.name, index);
        item.alias = index === 1 ? '' : `${item.name}$${index}`;
    });

    return items;
};

/**
 * Assigns alias to models with the same name.
 * Modifies objects in-place and returns the same array.
 *
 * @param models - an array of models sorted by name
 * @returns the same array of models (modified)
 */
export function setDuplicateModelAliases(models: Model[]): Model[] {
    return assignDuplicateAliases(models);
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
    const normalizeImportPath = (value: string): string => (value.startsWith('./') ? value.slice(2) : value);
    const applyAliasToModel = (model: Model, imprt: Import): void => {
        const modelPath = normalizeImportPath(model.path);
        const importPath = normalizeImportPath(imprt.path);

        if (modelPath === importPath && model.type === imprt.name && imprt.alias) {
            model.alias = imprt.alias;
            model.base = imprt.alias;
            model.type = imprt.alias;
        }

        if (imprt.alias && model.imports?.some(item => normalizeImportPath(item.path) === importPath && item.name === imprt.name)) {
            if (model.base === imprt.name) {
                model.base = imprt.alias;
            }
            if (model.type === imprt.name) {
                model.type = imprt.alias;
            }
        }

        if (model.link) {
            applyAliasToModel(model.link, imprt);
        }

        if (model.properties?.length) {
            model.properties.forEach(child => applyAliasToModel(child, imprt));
        }

        if (model.enums?.length) {
            model.enums.forEach(child => applyAliasToModel(child, imprt));
        }
    };

    models.forEach(model => {
        const importsWithSourcePath = model.imports.map(imprt => {
            const sourcePath = imprt.path;
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
                    importPath = `${relativePath}/${file}`;
                } else {
                    importPath = `${relativePath}/${file}`;
                }
            }
            const mappedImport = Object.assign(imprt, {
                alias: importAlias,
                path: importPath,
            });
            return { mappedImport, sourcePath };
        });

        model.imports = importsWithSourcePath.map(item => item.mappedImport);

        importsWithSourcePath.forEach(item => {
            applyAliasToModel(model, item.mappedImport);
            applyAliasToModel(model, Object.assign({}, item.mappedImport, { path: item.sourcePath }));
        });
    });
    return models;
}
