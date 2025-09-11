import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { mock, test } from 'node:test';

import { fileSystem } from '../fileSystem';
import { Templates } from '../registerHandlebarTemplates';
import { writeClientFullIndex } from '../writeClientFullIndex';

test('@unit: writeClientIndex writes to filesystem', async () => {
    const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

    // Re-assigning the function manually with a mock
    const originalWriteFile = fileSystem.writeFile;
    fileSystem.writeFile = mock.fn(async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
        writeFileCalls.push([path, content]);
    });

    const templates: Templates = {
        indexes: {
            full: () => 'fullIndex',
            simple: () => 'simpleIndex',
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

    await writeClientFullIndex({ templates, outputPath: '/', core: [], models: [], schemas: [], services: [] });

    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('index.ts') && content.toString().includes('index')),
        'Expected writeFile to be called with index content for index.ts'
    );

    // Restoring the original function
    fileSystem.writeFile = originalWriteFile;
});
