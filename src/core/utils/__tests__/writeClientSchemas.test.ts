import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { describe, test } from 'node:test';

import { HttpClient } from '../../types/enums/HttpClient.enum';
import { Model } from '../../types/shared/Model.model';
import { WriteClient } from '../../WriteClient';
import { fileSystem } from '../fileSystem';
import { Templates } from '../registerHandlebarTemplates';

describe('@unit: writeClientSchemas', () => {
    test('writes to filesystem', async () => {
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

        // Re-assigning the function manually with a mock
        const originalWriteFile = fileSystem.writeFile;
        fileSystem.writeFile = async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        };

        const models: Model[] = [
            {
                export: 'interface',
                name: 'MyModel',
                alias: '',
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

        await writeClient.writeClientSchemas({
            models,
            templates,
            outputSchemasPath: '/',
            httpClient: HttpClient.FETCH,
            useUnionTypes: false,
        });

        assert.ok(
            writeFileCalls.some(([filePath, content]) => filePath.toString().includes('MyModelSchema.ts') && content.toString().includes('schema')),
            'Expected writeFile to be called with schema content for MyModelSchema.ts'
        );

        // Restoring the original function
        fileSystem.writeFile = originalWriteFile;
    });
});
