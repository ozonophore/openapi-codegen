import { Templates } from "../../types/base/Templates.model";

export type SimpleClientArtifacts = {
    templates: Templates;
    outputPath: string;
    core: string[];
    models: string[];
    schemas: string[];
    services: string[];
}