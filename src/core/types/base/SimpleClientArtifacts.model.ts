import { Templates } from "../../utils/registerHandlebarTemplates";

/**
 * @param templates: The loaded handlebar templates
 * @param outputPath: Directory to write the generated files to
 * @param useUnionTypes: Use union types instead of enums
 * @param exportCore: Generate core
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 */
export type SimpleClientArtifacts = {
    templates: Templates;
    outputPath: string;
    core: string[];
    models: string[];
    schemas: string[];
    services: string[];
}