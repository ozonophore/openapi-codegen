import { OpenApiGeneratorPlugin } from '../GeneratorPlugin.model';

/**
 * Reads `x-typescript-type` OpenAPI extension and maps it to a generated TS type.
 */
export const xTypescriptTypePlugin: OpenApiGeneratorPlugin = {
    name: 'x-typescript-type',
    resolveSchemaTypeOverride: ({ schema }) => {
        const customType = schema['x-typescript-type'];
        return typeof customType === 'string' && customType.trim() ? customType.trim() : undefined;
    },
};
