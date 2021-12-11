import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { mkdir, writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { WriteClient } from './writeClient';

jest.mock('./fileSystem');

describe('writeClient', () => {
    it('should write to filesystem', async () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: 'v1',
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
            },
        };
        await new WriteClient().writeClient({
            client,
            templates,
            output: { output: './dist' },
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportServices: true,
            exportModels: true,
            exportSchemas: true,
            clean: true,
        });

        expect(mkdir).toBeCalled();
        expect(writeFile).toBeCalled();
    });
});
