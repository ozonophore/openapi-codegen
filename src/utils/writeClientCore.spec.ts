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

        expect(writeFile).toHaveBeenCalledWith(expect.stringMatching(/OpenAPI.ts/), 'settings');
        expect(writeFile).toHaveBeenCalledWith(expect.stringMatching(/ApiError.ts/), 'apiError');
        expect(writeFile).toHaveBeenCalledWith(expect.stringMatching(/ApiRequestOptions.ts/), 'apiRequestOptions');
        expect(writeFile).toHaveBeenCalledWith(expect.stringMatching(/ApiResult.ts/), 'apiResult');
        expect(writeFile).toHaveBeenCalledWith(expect.stringMatching(/request.ts/), 'request');
        expect(writeFile).toHaveBeenCalledWith(expect.stringMatching(/CancelablePromise.ts/), 'cancelablePromise');
        expect(writeFile).toHaveBeenCalledWith(expect.stringMatching(/HttpStatusCode.ts/), 'httpStatusCode');
    });
});
