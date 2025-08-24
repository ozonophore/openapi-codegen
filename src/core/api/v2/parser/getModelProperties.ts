import get from 'lodash-es/get';

import type { Model } from '../../../types/shared/Model.model';
import { escapeName } from '../../../utils/escapeName';
import { getComment } from '../../../utils/getComment';
import { getPattern } from '../../../utils/getPattern';
import { normalizeRef } from '../../../utils/normalizeRef';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiSchema } from '../types/OpenApiSchema.model';

export function getModelProperties(this: Parser, openApi: OpenApi, definition: OpenApiSchema, parentRef: string): Model[] {
    const models: Model[] = [];
    for (const propertyName in definition.properties) {
        if (get(definition.properties, propertyName, null)) {
            const property = definition.properties[propertyName];
            const propertyRequired = definition.required?.includes(propertyName) || property.default !== undefined;
            if (property.$ref) {
                const normalizedRef = normalizeRef(property.$ref, parentRef);
                const model = this.getType(property.$ref, normalizedRef);
                models.push({
                    name: escapeName(propertyName),
                    alias: '',
                    path: '',
                    export: 'reference',
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: null,
                    description: getComment(property.description),
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired,
                    isNullable: property['x-nullable'] === true,
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
                    properties: [],
                });
            } else {
                const model = this.getModel({ openApi, definition: property, parentRef });
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
                    isNullable: property['x-nullable'] === true,
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
                    properties: model.properties,
                });
            }
        }
    }
    return models;
}
