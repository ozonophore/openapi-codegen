import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { describe, test } from 'node:test';

import { WriteClient } from '../../WriteClient';
import { fileSystem } from '../fileSystem';
import { Templates } from '../registerHandlebarTemplates';

describe('@unit: writeClientFullIndex', () => {
    test('writes to filesystem', async () => {
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

        // Re-assigning the function manually with a mock
        const originalWriteFile = fileSystem.writeFile;
        fileSystem.writeFile = async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        };

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

        await writeClient.writeClientFullIndex({ templates, outputPath: '/', core: [], models: [], schemas: [], services: [] });

        assert.ok(
            writeFileCalls.some(([filePath, content]) => filePath.toString().includes('index.ts') && content.toString().includes('fullIndex')),
            'Expected writeFile to be called with index content for index.ts'
        );

        // Restoring the original function
        fileSystem.writeFile = originalWriteFile;
    });
});
