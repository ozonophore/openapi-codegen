import { join, relative } from 'path';

import type { Model } from '../../../client/interfaces/Model';
import { getDefinition } from '../../../utils/getDefinition';
import { getRefs } from '../../../utils/getRefs';
import { sortModelsByName } from '../../../utils/sortModelsByName';
import { unique } from '../../../utils/unique';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';

export function getModels(openApi: OpenApi): Model[] {
    let models: Model[] = [];
    if (openApi.components) {
        const refs = getRefs(openApi);
        for (const ref of refs) {
            const definition: any = getDefinition(ref, openApi);
            if (definition) {
                const definitionType = getType(ref);
                const model = getModel({ openApi: openApi, definition: definition, isDefinition: true, name: definitionType.base, path: definitionType.path });
                models.push(model);
            }
        }
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const definition = openApi.components.schemas[definitionName];
                const definitionType = getType(definitionName);
                const model = getModel({ openApi: openApi, definition: definition, isDefinition: true, name: definitionType.base, path: definitionType.path });
                models.push(model);
            }
        }
        models = sortModelsByName(models.filter(unique));
        let previous: any;
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
        models.forEach(model => {
            model.properties = model.properties.map(property => {
                const propertyModel = models.filter(value => value.path === property.path && value.name === property.type);
                if (propertyModel.length > 0) {
                    return Object.assign(property, { alias: propertyModel[0].alias });
                }
                return property;
            });
        });
    }
    return models;
}
