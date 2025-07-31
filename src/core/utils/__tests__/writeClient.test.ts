import assert from 'node:assert/strict';
import { PathOrFileDescriptor } from 'node:fs';
import { mock, test } from 'node:test';

import { HttpClient } from '../../types/Enums';
import type { Client } from '../../types/shared/Client.model';
import {fileSystem} from '../fileSystem';
import { getOutputPaths } from '../getOutputPaths';
import { WriteClient } from '../writeClient';



test('@unit: writeClient should write to filesystem', async () => {
    const mkdirCalls: string[] = [];
    const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

    // We keep the original implementations
    const originalMkdir = fileSystem.mkdir;
    const originalWriteFile = fileSystem.writeFile;

    // Mock the functions
    fileSystem.mkdir = mock.fn(async (path: string) => {
        mkdirCalls.push(path);
        return path;
    });


    fileSystem.writeFile = mock.fn(async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
        writeFileCalls.push([path, content]);
    });

    const client: Client = {
        server: 'http://localhost:8080',
        version: 'v1',
        models: [],
        services: [],
    };

    const templates = {
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

    const outputPaths = getOutputPaths({ output: './dist' });

    await new WriteClient().writeClient({
        client,
        templates,
        outputPaths,
        httpClient: HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportServices: true,
        exportModels: true,
        exportSchemas: true,
        clean: true,
    });

    assert.ok(mkdirCalls.length > 0, 'mkdir should be called at least once');
    assert.ok(writeFileCalls.length > 0, 'writeFile should be called at least once');

    // Restoring the original implementations
    fileSystem.mkdir = originalMkdir;
    fileSystem.writeFile = originalWriteFile;
});
