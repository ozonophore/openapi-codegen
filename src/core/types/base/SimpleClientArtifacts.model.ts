import { Templates } from "../../utils/registerHandlebarTemplates";

export type SimpleClientArtifacts = {
    templates: Templates;
    outputPath: string;
    core: string[];
    models: string[];
    schemas: string[];
    services: string[];
}