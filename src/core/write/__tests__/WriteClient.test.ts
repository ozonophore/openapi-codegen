import assert from 'node:assert/strict';
import { PathOrFileDescriptor } from 'node:fs';
import { describe, mock, test } from 'node:test';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { Templates } from '../../types/base/Templates.model';
import { EmptySchemaStrategy } from '../../types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../../types/enums/ValidationLibrary.enum';
import type { Client } from '../../types/shared/Client.model';
import { getOutputPaths } from '../../utils/getOutputPaths';
import { WriteClient } from '../WriteClient';
import { writeClientArtifacts } from '../writeClientArtifacts';

describe('@unit: writeClientArtifacts — reuse context', () => {
    test('forwards reuse.inputPath to writeClientSchemas when validationLibrary is set', async () => {
        const originalMkdir = fileSystemHelpers.mkdir;
        fileSystemHelpers.mkdir = mock.fn(async () => {});

        const client: Client = { server: '', version: '', models: [], services: [] };
        const templates: Templates = {
            indexes: { full: () => '', simple: () => '', core: () => '', models: () => '', schemas: () => '', services: () => '' },
            exports: { client: () => '', model: () => '', schema: () => '', service: () => '', models: () => '', classesModel: () => '' },
            core: {
                settings: () => '',
                apiError: () => '',
                apiRequestOptions: () => '',
                apiResult: () => '',
                request: () => '',
                cancelablePromise: () => '',
                httpStatusCode: () => '',
                createExecutorAdapter: () => '',
                legacyRequestAdapter: () => '',
                requestExecutor: () => '',
                apiErrorInterceptor: () => '',
                interceptors: () => '',
                withInterceptors: () => '',
                baseDto: () => '',
                dtoUtils: () => '',
            },
        };
        const outputPaths = getOutputPaths({ output: './dist' });

        let capturedReuseInputPath: string | undefined;
        const adapter = {
            writeOutputFile: mock.fn(async () => ({})),
            registerLintTarget: mock.fn(),
            logger: { info: mock.fn(), warn: mock.fn() },
        };
        const noop = mock.fn(async () => {});

        await writeClientArtifacts(
            adapter,
            { register: mock.fn() },
            {
                client,
                templates,
                outputPaths,
                httpClient: HttpClient.FETCH,
                useOptions: false,
                useUnionTypes: false,
                excludeCoreServiceFiles: true,
                validationLibrary: ValidationLibrary.ZOD,
                emptySchemaStrategy: EmptySchemaStrategy.KEEP,
                reuse: {
                    reuseStore: {} as never,
                    optionsSlice: {} as never,
                    specInput: 'api',
                    inputPath: './openapi.yaml',
                    modelSchemas: new Map(),
                },
            },
            {
                writeClientCore: noop as never,
                writeClientCoreIndex: noop as never,
                writeClientServices: noop as never,
                writeClientServicesIndex: noop as never,
                writeClientExecutor: noop as never,
                writeClientSchemas: mock.fn(async (_adapter: unknown, opts: { reuse?: { inputPath?: string } }) => {
                    capturedReuseInputPath = opts.reuse?.inputPath;
                    return [];
                }) as never,
                writeClientSchemasIndex: noop as never,
                writeClientModels: noop as never,
                writeClientModelsIndex: noop as never,
            }
        );

        assert.equal(capturedReuseInputPath, './openapi.yaml');

        fileSystemHelpers.mkdir = originalMkdir;
    });
});

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
                models: () => 'models',
                classesModel: () => 'classesModel',
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
                legacyRequestAdapter: () => 'legacyRequestAdapter',
                requestExecutor: () => 'requestExecutor',
                apiErrorInterceptor: () => 'apiErrorInterceptor',
                interceptors: () => 'interceptors',
                withInterceptors: () => 'withInterceptors',
                baseDto: () => 'baseDto',
                dtoUtils: () => 'dtoUtils',
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
            emptySchemaStrategy: EmptySchemaStrategy.KEEP,
        });

        assert.ok(mkdirCalls.length > 0, 'mkdir should be called at least once');
        assert.ok(writeFileCalls.length > 0, 'writeFile should be called at least once');

        // Restoring the original implementations
        fileSystemHelpers.mkdir = originalMkdir;
        fileSystemHelpers.writeFile = originalWriteFile;
    });
});
