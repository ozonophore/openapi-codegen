import type { Model } from '../../../client/interfaces/Model';
import { getPattern } from '../../../utils/getPattern';
import { ModelConfig } from '../interfaces/ModelConfig';
import { extendEnum } from './extendEnum';
import { getComment } from './getComment';
import { getEnum } from './getEnum';
import { getEnumFromDescription } from './getEnumFromDescription';
import { getModelComposition } from './getModelComposition';
import { getModelDefault } from './getModelDefault';
import { getModelProperties } from './getModelProperties';
import { getType } from './getType';

export function getModel(config: ModelConfig): Model {
    const { openApi, definition, isDefinition = false, name = '', path = '', getTypeByRef, parentRef } = config;
    const model: Model = {
        name,
        alias: '',
        path,
        export: 'interface',
        type: 'any',
        base: 'any',
        link: null,
        template: null,
        description: getComment(definition.description),
        isDefinition,
        isReadOnly: definition.readOnly === true,
        isNullable: definition.nullable === true,
        isRequired: definition.default !== undefined,
        format: definition.format,
        maximum: definition.maximum,
        exclusiveMaximum: definition.exclusiveMaximum,
        minimum: definition.minimum,
        exclusiveMinimum: definition.exclusiveMinimum,
        multipleOf: definition.multipleOf,
        maxLength: definition.maxLength,
        minLength: definition.minLength,
        maxItems: definition.maxItems,
        minItems: definition.minItems,
        uniqueItems: definition.uniqueItems,
        maxProperties: definition.maxProperties,
        minProperties: definition.minProperties,
        pattern: getPattern(definition.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };

    if (definition.$ref) {
        const definitionRef = getType(definition.$ref, parentRef, getTypeByRef);
        model.export = 'reference';
        model.type = definitionRef.type;
        model.base = definitionRef.base;
        model.imports.push(...definitionRef.imports);
        model.default = getModelDefault(definition, model);
        return model;
    }

    if (definition.enum && definition.type !== 'boolean') {
        const enumerators = getEnum(definition.enum);
        const extendedEnumerators = extendEnum(enumerators, definition);
        if (extendedEnumerators.length) {
            model.export = 'enum';
            model.type = 'string';
            model.base = 'string';
            model.enum.push(...extendedEnumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if ((definition.type === 'int' || definition.type === 'integer') && definition.description) {
        const enumerators = getEnumFromDescription(definition.description);
        if (enumerators.length) {
            model.export = 'enum';
            model.type = 'number';
            model.base = 'number';
            model.enum.push(...enumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItems = getType(definition.items.$ref, parentRef, getTypeByRef);
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.imports.push(...arrayItems.imports);
            model.default = getModelDefault(definition, model);
            return model;
        } else {
            const arrayItems = getModel({ openApi: openApi, definition: definition.items, getTypeByRef: getTypeByRef, parentRef: parentRef });
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.link = arrayItems;
            model.imports.push(...arrayItems.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.type === 'object' && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            const additionalProperties = getType(definition.additionalProperties.$ref, parentRef, getTypeByRef);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.imports.push(...additionalProperties.imports);
            model.default = getModelDefault(definition, model);
            return model;
        } else {
            const additionalProperties = getModel({ openApi: openApi, definition: definition.additionalProperties, getTypeByRef: getTypeByRef, parentRef: parentRef });
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.link = additionalProperties;
            model.imports.push(...additionalProperties.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.oneOf?.length) {
        const composition = getModelComposition(openApi, definition, definition.oneOf, 'one-of', getModel, getTypeByRef, parentRef);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.properties.push(...composition.properties);
        model.enums.push(...composition.enums);
        return model;
    }

    if (definition.anyOf?.length) {
        const composition = getModelComposition(openApi, definition, definition.anyOf, 'any-of', getModel, getTypeByRef, parentRef);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.properties.push(...composition.properties);
        model.enums.push(...composition.enums);
        return model;
    }

    if (definition.allOf?.length) {
        const composition = getModelComposition(openApi, definition, definition.allOf, 'all-of', getModel, getTypeByRef, parentRef);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.properties.push(...composition.properties);
        model.enums.push(...composition.enums);
        return model;
    }

    if (definition.type === 'object') {
        model.export = 'interface';
        model.type = 'any';
        model.base = 'any';
        model.default = getModelDefault(definition, model);

        if (definition.properties) {
            const properties = getModelProperties(openApi, definition, getModel, getTypeByRef, parentRef);
            properties.forEach(property => {
                model.imports.push(...property.imports);
                model.enums.push(...property.enums);
                model.properties.push(property);
                if (property.export === 'enum') {
                    model.enums.push(property);
                }
            });
        }
        return model;
    }

    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType(definition.type, parentRef, getTypeByRef);
        model.export = 'generic';
        model.type = definitionType.type;
        model.base = definitionType.base;
        model.imports.push(...definitionType.imports);
        model.default = getModelDefault(definition, model);
        return model;
    }

    return model;
}
