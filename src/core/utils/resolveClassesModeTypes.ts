import type { Client } from '../types/shared/Client.model';
import type { Import } from '../types/shared/Import.model';
import type { Model } from '../types/shared/Model.model';

const normalizeImportPath = (value: string): string => (value.startsWith('./') ? value.slice(2) : value);

const resolveExportName = (model: Model, pathToExportName: Map<string, string>): string | undefined => {
    const modelPath = normalizeImportPath(model.path);
    if (modelPath) {
        const exportName = pathToExportName.get(modelPath);
        if (exportName) {
            return exportName;
        }
    }

    for (const imprt of model.imports ?? []) {
        const importPath = normalizeImportPath(imprt.path);
        const exportName = pathToExportName.get(importPath);
        if (exportName && (imprt.name === model.base || imprt.name === model.type)) {
            return exportName;
        }
    }

    return undefined;
};

const applyExportNameToModel = (model: Model, pathToExportName: Map<string, string>): void => {
    const exportName = resolveExportName(model, pathToExportName);
    if (exportName) {
        model.base = exportName;
        model.type = exportName;
    }

    if (model.link) {
        applyExportNameToModel(model.link, pathToExportName);
    }

    model.properties?.forEach(child => applyExportNameToModel(child, pathToExportName));
};

const resolveImportForClassesMode = (imprt: Import, pathToExportName: Map<string, string>): Import => {
    const importPath = normalizeImportPath(imprt.path);
    const exportName = pathToExportName.get(importPath);
    if (!exportName || exportName === imprt.name) {
        return imprt;
    }

    return {
        ...imprt,
        name: exportName,
        alias: '',
    };
};

/**
 * Заменяет импорты и типы моделей на exportName в режиме classes.
 * @param client сгенерированный клиент
 * @returns клиент с обновлёнными импортами и типами
 */
export const resolveClassesModeTypes = (client: Client): Client => {
    const pathToExportName = new Map<string, string>();

    client.models.forEach(model => {
        if (!model.isDefinition) {
            return;
        }
        const exportName = model.exportName || model.alias || model.name;
        pathToExportName.set(normalizeImportPath(model.path), exportName);
    });

    client.services.forEach(service => {
        service.imports = service.imports.map(imprt => resolveImportForClassesMode(imprt, pathToExportName));

        service.operations.forEach(operation => {
            operation.imports = operation.imports.map(imprt => resolveImportForClassesMode(imprt, pathToExportName));
            operation.results.forEach(result => applyExportNameToModel(result, pathToExportName));
            operation.parameters.forEach(parameter => applyExportNameToModel(parameter, pathToExportName));
            operation.parametersPath.forEach(parameter => applyExportNameToModel(parameter, pathToExportName));
            operation.parametersQuery.forEach(parameter => applyExportNameToModel(parameter, pathToExportName));
            operation.parametersForm.forEach(parameter => applyExportNameToModel(parameter, pathToExportName));
            operation.parametersHeader.forEach(parameter => applyExportNameToModel(parameter, pathToExportName));
            operation.parametersCookie.forEach(parameter => applyExportNameToModel(parameter, pathToExportName));
            if (operation.parametersBody) {
                applyExportNameToModel(operation.parametersBody, pathToExportName);
            }
        });
    });

    return client;
};
