import type { Service } from '../client/interfaces/Service';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientServices } from './writeClientServices';

jest.mock('./fileSystem');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'MyService',
                originName: 'MyService',
                operations: [],
                imports: [],
            },
        ];

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

        await writeClientServices({
            services,
            templates,
            outputPath: '/',
            httpClient: HttpClient.FETCH,
            useUnionTypes: false,
            useOptions: false,
            outputModels: '/',
            outputCore: '/',
            useCancelableRequest: false,
        });

        expect(writeFile).toBeCalledWith('/MyService.ts', 'service');
    });
});
