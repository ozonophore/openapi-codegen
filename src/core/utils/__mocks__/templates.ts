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
        models: (params?: { models?: Array<{ rawName?: string; dtoName?: string; dtoGetters?: unknown[] }> }) => {
            const models = params?.models ?? [];
            const first = models[0];
            if (!first) return 'models';
            return `// models:${first.rawName ?? ''}:${first.dtoName ?? ''}:${first.dtoGetters?.length ?? 0}`;
        },
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
        baseDto: () => 'BaseDto',
        dtoUtils: () => 'dtoUtils',
    },
};
