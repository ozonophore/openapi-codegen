import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientCore } from './writeClientCore';

jest.mock('./fileSystem');

describe('writeClientCore', () => {
    it('should write to filesystem', async () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: '1.0',
            models: [],
            services: [],
        };

        const templates: Templates = {
            index: () => 'index',
            exports: {
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
            },
        };

        const useCancelableRequest = true;

        await writeClientCore({ client, templates, outputCorePath: '/', httpClient: HttpClient.FETCH, useCancelableRequest });

        expect(writeFile).toBeCalledWith('/OpenAPI.ts', 'settings');
        expect(writeFile).toBeCalledWith('/ApiError.ts', 'apiError');
        expect(writeFile).toBeCalledWith('/ApiRequestOptions.ts', 'apiRequestOptions');
        expect(writeFile).toBeCalledWith('/ApiResult.ts', 'apiResult');
        expect(writeFile).toBeCalledWith('/request.ts', 'request');
        expect(writeFile).toBeCalledWith('/CancelablePromise.ts', 'cancelablePromise');
        expect(writeFile).toBeCalledWith('/HttpStatusCode.ts', 'httpStatusCode');
    });
});
