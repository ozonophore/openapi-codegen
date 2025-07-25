import type { Model } from '../../../types/shared/Model.model';
import type { OpenApiSchema } from '../types/OpenApiSchema.model';

export function getModelDefault(definition: OpenApiSchema, model?: Model): string | undefined {
    if (definition.default === undefined) {
        return;
    }

    if (definition.default === null) {
        return 'null';
    }

    const type = definition.type || typeof definition.default;

    switch (type) {
        case 'int':
        case 'integer':
        case 'number':
            if (model?.export === 'enum' && model.enum?.[definition.default]) {
                return model.enum[definition.default].value;
            }
            return definition.default;

        case 'boolean':
            return JSON.stringify(definition.default);

        case 'string':
            return `'${definition.default}'`;

        case 'object':
            try {
                return JSON.stringify(definition.default, null, 4);
            } catch {
                // Ignore
            }
    }

    return;
}
