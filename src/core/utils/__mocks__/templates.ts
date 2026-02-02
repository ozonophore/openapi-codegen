import { Templates } from '../../types/base/Templates.model';

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
        client: () => 'client',
        model: () => 'model',
        schema: () => 'schema',
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
        createExecutorAdapter: () => 'createExecutorAdapter',
        requestExecutor: () => 'requestExecutor',
        apiErrorInterceptor: () => 'apiErrorInterceptor',
        interceptors: () => 'interceptors',
        withInterceptors: () => 'withInterceptors',
    },
};
