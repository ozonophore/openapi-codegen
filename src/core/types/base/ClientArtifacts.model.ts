import { Templates } from "../../utils/registerHandlebarTemplates";
import { ExportedModel } from "./ExportedModel.model";
import { ExportedService } from "./ExportedService.model";

/**
 * @param templates: The loaded handlebar templates
 * @param outputPath: Directory to write the generated files to
 * @param useUnionTypes: Use union types instead of enums
 * @param exportCore: Generate core
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 */
export type ClientArtifacts = {
    templates: Templates;
    outputPath: string;
    core: string[];
    models: ExportedModel[];
    schemas: ExportedModel[];
    services: ExportedService[];
}