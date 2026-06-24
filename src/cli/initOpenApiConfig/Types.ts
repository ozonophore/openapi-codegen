export type RequestScaffoldFormat = 'transport' | 'executor' | 'adapter';

export type CLITemplates = {
    config: Handlebars.TemplateDelegate;
    request: Handlebars.TemplateDelegate;
    requestExecutor: Handlebars.TemplateDelegate;
    createExecutorAdapter: Handlebars.TemplateDelegate;
};
