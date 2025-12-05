import type { Model } from '../../../types/shared/Model.model';
import { extendEnum } from '../../../utils/extendEnum';
import { getComment } from '../../../utils/getComment';
import { getEnum } from '../../../utils/getEnum';
import { getEnumFromDescription } from '../../../utils/getEnumFromDescription';
import { getPattern } from '../../../utils/getPattern';
import { normalizeRef } from '../../../utils/normalizeRef';
import { Parser } from '../Parser';
import { ModelConfig } from '../types/ModelConfig.model';

export function getModel(this: Parser, config: ModelConfig): Model {
    const { openApi, definition, isDefinition = false, name = '', path = '', parentRef } = config;
    const model: Model = {
        name,
        path,
        alias: '',
        export: 'interface',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: getComment(definition.description),
        isDefinition,
        isReadOnly: definition.readOnly === true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        isNullable: definition['x-nullable'] === true,
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
        const normalizedRef = normalizeRef(definition.$ref, parentRef);
        const definitionRef = this.getType(definition.$ref, normalizedRef);
        model.export = 'reference';
        model.type = definitionRef.type;
        model.base = definitionRef.base;
        model.template = definitionRef.template;
        model.imports.push(...definitionRef.imports);
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
            return model;
        }
    }

    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const normalizedRef = normalizeRef(definition.items.$ref, parentRef);
            const arrayItems = this.getType(definition.items.$ref, normalizedRef);
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.imports.push(...arrayItems.imports);
            return model;
        } else {
            const arrayItems = this.getModel({ openApi: openApi, definition: definition.items, parentRef });
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.link = arrayItems;
            model.imports.push(...arrayItems.imports);
            return model;
        }
    }

    if (definition.type === 'object' && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            const additionalProperties = this.getType(definition.additionalProperties.$ref, parentRef);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.imports.push(...additionalProperties.imports);
            return model;
        } else {
            const additionalProperties = this.getModel({ openApi: openApi, definition: definition.additionalProperties, parentRef });
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.link = additionalProperties;
            model.imports.push(...additionalProperties.imports);
            return model;
        }
    }

    if (definition.allOf?.length) {
        const composition = this.getModelComposition(openApi, definition, definition.allOf, 'all-of', parentRef);
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

        if (definition.properties) {
            const properties = this.getModelProperties(openApi, definition, parentRef);
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
        const definitionType = this.getType(definition.type, parentRef);
        model.export = 'generic';
        model.type = definitionType.type;
        model.base = definitionType.base;
        model.template = definitionType.template;
        model.imports.push(...definitionType.imports);
        return model;
    }

    return model;
}
