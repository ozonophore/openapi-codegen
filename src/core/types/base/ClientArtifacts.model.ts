import { Templates } from "../../utils/registerHandlebarTemplates";
import { ExportedModel } from "./ExportedModel.model";
import { ExportedService } from "./ExportedService.model";

export type ClientArtifacts = {
    templates: Templates;
    outputPath: string;
    core: string[];
    models: ExportedModel[];
    schemas: ExportedModel[];
    services: ExportedService[];
}