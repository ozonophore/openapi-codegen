import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { describe, test } from 'node:test';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { HttpClient } from '../../types/enums/HttpClient.enum';
import { Service } from '../../types/shared/Service.model';
import { WriteClient } from '../../WriteClient';
import { Templates } from '../registerHandlebarTemplates';

describe('@unit: writeClientServices', () => {
    test('writes to filesystem', async () => {
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

        // Re-assigning the function manually with a mock
        const originalWriteFile = fileSystemHelpers.writeFile;
        fileSystemHelpers.writeFile = async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        };

        const services: Service[] = [
            {
                name: 'MyService',
                originName: 'MyService',
                operations: [],
                imports: [],
            },
        ];

        const templates: Templates = {
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
        const writeClient = new WriteClient();
        await writeClient.writeClientServices({
            services,
            templates,
            outputPaths: {
                outputCore: '/',
                outputModels: '/',
                outputServices: '/',
            },
            httpClient: HttpClient.FETCH,
            useUnionTypes: false,
            useOptions: false,
            useCancelableRequest: false,
        });

        assert.ok(
            writeFileCalls.some(([filePath, content]) => filePath.toString().includes('MyService.ts') && content.toString().includes('service')),
            'Expected writeFile to be called with service content for MyService.ts'
        );

        // Restoring the original function
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fileSystemHelpers.writeFile = originalWriteFile;
    });
});
