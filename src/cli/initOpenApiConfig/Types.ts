import { EOptionType } from "./Enums";

export type TInitOpenApiConfigParams = {
    type: EOptionType;
    openapiConfig?: string;
}

export type CLITemplates = {
    config: Handlebars.TemplateDelegate;
    request: Handlebars.TemplateDelegate;
    requestExecutor: Handlebars.TemplateDelegate;
};