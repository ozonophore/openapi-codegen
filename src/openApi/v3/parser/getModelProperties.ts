import type { Model } from '../../../client/interfaces/Model';
import { getPattern } from '../../../utils/getPattern';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { escapeName } from './escapeName';
import { getComment } from './getComment';
import type { getModel } from './getModel';
import { Parser } from '../Parser';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

export function getModelProperties(this: Parser, openApi: OpenApi, definition: OpenApiSchema, parentRef: string): Model[] {
    const models: Model[] = [];
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = definition.required?.includes(propertyName) || property.default !== undefined;
            if (property.$ref) {
                const model = this.getType(property.$ref, parentRef);
                models.push({
                    name: escapeName(propertyName),
                    alias: '',
                    path: model.path,
                    export: 'reference',
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: null,
                    description: getComment(property.description),
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired,
                    isNullable: property.nullable === true,
                    format: property.format,
                    maximum: property.maximum,
                    exclusiveMaximum: property.exclusiveMaximum,
                    minimum: property.minimum,
                    exclusiveMinimum: property.exclusiveMinimum,
                    multipleOf: property.multipleOf,
                    maxLength: property.maxLength,
                    minLength: property.minLength,
                    maxItems: property.maxItems,
                    minItems: property.minItems,
                    uniqueItems: property.uniqueItems,
                    maxProperties: property.maxProperties,
                    minProperties: property.minProperties,
                    pattern: getPattern(property.pattern),
                    imports: model.imports,
                    enum: [],
                    enums: [],
                    properties: []
                });
            } else {
                const model = this.getModel({ openApi: openApi, definition: property, parentRef: parentRef });
                models.push({
                    name: escapeName(propertyName),
                    alias: '',
                    path: model.path,
                    export: model.export,
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: model.link,
                    description: getComment(property.description),
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired,
                    isNullable: property.nullable === true,
                    format: property.format,
                    maximum: property.maximum,
                    exclusiveMaximum: property.exclusiveMaximum,
                    minimum: property.minimum,
                    exclusiveMinimum: property.exclusiveMinimum,
                    multipleOf: property.multipleOf,
                    maxLength: property.maxLength,
                    minLength: property.minLength,
                    maxItems: property.maxItems,
                    minItems: property.minItems,
                    uniqueItems: property.uniqueItems,
                    maxProperties: property.maxProperties,
                    minProperties: property.minProperties,
                    pattern: getPattern(property.pattern),
                    imports: model.imports,
                    enum: model.enum,
                    enums: model.enums,
                    properties: model.properties
                });
            }
        }
    }

    return models;
}
