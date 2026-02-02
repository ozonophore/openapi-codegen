import * as Handlebars from 'handlebars/runtime';

export interface Templates {
    indexes: {
        full: Handlebars.TemplateDelegate;
        simple: Handlebars.TemplateDelegate;
        core: Handlebars.TemplateDelegate;
        models: Handlebars.TemplateDelegate;
        schemas: Handlebars.TemplateDelegate;
        services: Handlebars.TemplateDelegate;
    };
    exports: {
        client: Handlebars.TemplateDelegate;
        model: Handlebars.TemplateDelegate;
        schema: Handlebars.TemplateDelegate | undefined;
        service: Handlebars.TemplateDelegate;
    };
    core: {
        settings: Handlebars.TemplateDelegate;
        apiError: Handlebars.TemplateDelegate;
        apiRequestOptions: Handlebars.TemplateDelegate;
        apiResult: Handlebars.TemplateDelegate;
        request: Handlebars.TemplateDelegate;
        cancelablePromise: Handlebars.TemplateDelegate;
        httpStatusCode: Handlebars.TemplateDelegate;
        requestExecutor: Handlebars.TemplateDelegate;
        createExecutorAdapter: Handlebars.TemplateDelegate;
        interceptors: Handlebars.TemplateDelegate;
        apiErrorInterceptor: Handlebars.TemplateDelegate;
        withInterceptors: Handlebars.TemplateDelegate;
    };
}
