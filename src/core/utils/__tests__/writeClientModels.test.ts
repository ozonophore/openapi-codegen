import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { describe, test } from 'node:test';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { HttpClient } from '../../types/enums/HttpClient.enum';
import { Model } from '../../types/shared/Model.model';
import { WriteClient } from '../../WriteClient';
import { Templates } from '../registerHandlebarTemplates';

describe('@unit: writeClientModels', () => {
    test('writes to filesystem', async () => {
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

        // Re-assigning the function manually with a mock
        const originalWriteFile = fileSystemHelpers.writeFile;
        fileSystemHelpers.writeFile = async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        };

        const models: Model[] = [
            {
                export: 'interface',
                name: 'MyModel',
                path: 'MyModel',
                type: 'MyModel',
                base: 'MyModel',
                template: null,
                link: null,
                description: null,
                isDefinition: true,
                isReadOnly: false,
                isRequired: false,
                isNullable: false,
                imports: [],
                enum: [],
                enums: [],
                properties: [],
                alias: '',
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

        await writeClient.writeClientModels({
            models,
            templates,
            outputModelsPath: '/',
            httpClient: HttpClient.FETCH,
            useUnionTypes: false,
        });

        assert.ok(
            writeFileCalls.some(([filePath, content]) => filePath.toString().includes('MyModel.ts') && content.toString().includes('model')),
            'Expected writeFile to be called with model content for MyModel.ts'
        );

        // Restoring the original function
        fileSystemHelpers.writeFile = originalWriteFile;
    });
});
