import { Templates } from '../registerHandlebarTemplates';

export const templates: Templates = {
    indexes: {
        full: () => 'fullIndex',
        simple: () => 'simpleIndex',
        core: () => 'coreIndex',
        models: () => 'modelsIndex',
        schemas: () => 'schemasIndex',
        services: () => 'servicesIndex',
    },
    exports: {
        model: () => 'model',
        schema: () => 'schema',
        zodSchema: () => 'zodSchema',
        yupSchema: () => 'yupSchema',
        joiSchema: () => 'joiSchema',
        jsonSchemaSchema: () => 'jsonSchemaSchema',
        service: () => 'service',
    },
    core: {
        settings: () => 'settings',
        apiError: () => 'apiError',
        apiRequestOptions: () => 'apiRequestOptions',
        apiResult: () => 'apiResult',
        request: () => 'request',
        cancelablePromise: () => 'cancelablePromise',
        httpStatusCode: () => 'httpStatusCode',
        legacyRequestAdapter: () => 'legacyRequestAdapter',
        requestExecutor: () => 'requestExecutor',
    },
};
