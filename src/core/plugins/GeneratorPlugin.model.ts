export type TOpenApiVersion = 'v2' | 'v3';

export interface SchemaTypeOverrideContext {
    openApiVersion: TOpenApiVersion;
    parentRef: string;
}

export interface SchemaTypeOverrideInput {
    schema: Record<string, any>;
    context: SchemaTypeOverrideContext;
}

export interface OpenApiGeneratorPlugin {
    name: string;
    version?: string;
    resolveSchemaTypeOverride?: (input: SchemaTypeOverrideInput) => string | undefined;
}
