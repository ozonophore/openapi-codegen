import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { mock, test } from 'node:test';

import { HttpClient } from '../../types/Enums';
import { Client } from '../../types/shared/Client.model';
import { fileSystem } from '../fileSystem';
import { Templates } from '../registerHandlebarTemplates';
import { writeClientCore } from '../writeClientCore';

test('@unit: writeClientCore writes to filesystem', async () => {
    const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

    // Re-assigning the function manually with a mock
    const originalWriteFile = fileSystem.writeFile;
    fileSystem.writeFile = mock.fn(async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
        writeFileCalls.push([path, content]);
    });

    const client: Client = {
        server: 'http://localhost:8080',
        version: '1.0',
        models: [],
        services: [],
    };

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

    const useCancelableRequest = true;

    await writeClientCore({ client, templates, outputCorePath: '/', httpClient: HttpClient.FETCH, useCancelableRequest });

    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('OpenAPI.ts') && content.toString().includes('settings')),
        'Expected writeFile to be called with settings content for OpenAPI.ts'
    );
    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('ApiError.ts') && content.toString().includes('apiError')),
        'Expected writeFile to be called with apiError content for ApiError.ts'
    );
    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('ApiRequestOptions.ts') && content.toString().includes('apiRequestOptions')),
        'Expected writeFile to be called with apiRequestOptions content for ApiRequestOptions.ts'
    );
    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('ApiResult.ts') && content.toString().includes('apiResult')),
        'Expected writeFile to be called with apiResult content for ApiResult.ts'
    );
    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('request.ts') && content.toString().includes('request')),
        'Expected writeFile to be called with request content for request.ts'
    );
    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('CancelablePromise.ts') && content.toString().includes('cancelablePromise')),
        'Expected writeFile to be called with cancelablePromise content for CancelablePromise.ts'
    );
    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('HttpStatusCode.ts') && content.toString().includes('httpStatusCode')),
        'Expected writeFile to be called with httpStatusCode content for HttpStatusCode.ts'
    );

    // Restoring the original function
    fileSystem.writeFile = originalWriteFile;
});
