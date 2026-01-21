import assert from 'node:assert/strict';
import { PathOrFileDescriptor } from 'node:fs';
import { describe, mock, test } from 'node:test';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { Templates } from '../types/base/Templates.model';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../types/enums/ValidationLibrary.enum';
import type { Client } from '../types/shared/Client.model';
import { getOutputPaths } from '../utils/getOutputPaths';
import { WriteClient } from '../WriteClient';

describe('@unit: writeClient', () => {
    test('should write to filesystem', async () => {
        const mkdirCalls: string[] = [];
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

        // We keep the original implementations
        const originalMkdir = fileSystemHelpers.mkdir;
        const originalWriteFile = fileSystemHelpers.writeFile;

        // Mock the functions
        fileSystemHelpers.mkdir = mock.fn(async (path: string) => {
            mkdirCalls.push(path);
        });

        fileSystemHelpers.writeFile = mock.fn(async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        });

        const client: Client = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [],
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
                client: () => 'client',
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
                createExecutorAdapter: () => 'createExecutorAdapter',
                requestExecutor: () => 'requestExecutor',
            },
        };

        const outputPaths = getOutputPaths({ output: './dist' });

        await new WriteClient().writeClient({
            client,
            templates,
            outputPaths,
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            excludeCoreServiceFiles: false,
            validationLibrary: ValidationLibrary.NONE,
        });

        assert.ok(mkdirCalls.length > 0, 'mkdir should be called at least once');
        assert.ok(writeFileCalls.length > 0, 'writeFile should be called at least once');

        // Restoring the original implementations
        fileSystemHelpers.mkdir = originalMkdir;
        fileSystemHelpers.writeFile = originalWriteFile;
    });
});
