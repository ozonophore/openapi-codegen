import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';

import type { CoreOutputAdapter } from '../../CoreOutputAdapter';
import { EmptySchemaStrategy } from '../../types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../../types/enums/ValidationLibrary.enum';
import { getOutputPaths } from '../../utils/getOutputPaths';
import { writeClientArtifacts, type WriteClientArtifactsLeaves } from '../writeClientArtifacts';

describe('@unit: writeClientArtifacts expected-files delta', () => {
    test('returns empty delta when no new paths are registered', async () => {
        const expected = new Set<string>(['/pre-existing.ts']);
        const adapter: CoreOutputAdapter = {
            writeOutputFile: mock.fn(async () => 'unchanged'),
            registerLintTarget: mock.fn(),
            logger: { info: mock.fn(), warn: mock.fn() },
        };
        const noop = mock.fn(async () => {});
        const leaves = {
            writeClientCore: noop,
            writeClientCoreIndex: noop,
            writeClientServices: noop,
            writeClientServicesIndex: noop,
            writeClientExecutor: noop,
            writeClientSchemas: mock.fn(async () => []),
            writeClientSchemasIndex: noop,
            writeClientModels: noop,
            writeClientModelsIndex: noop,
        } as unknown as WriteClientArtifactsLeaves;

        const delta = await writeClientArtifacts(
            adapter,
            { register: mock.fn() },
            {
                client: { version: '1', server: 'http://localhost', models: [], services: [] },
                templates: {} as never,
                outputPaths: getOutputPaths({ output: './delta-empty' }),
                httpClient: HttpClient.FETCH,
                useOptions: false,
                useUnionTypes: false,
                excludeCoreServiceFiles: true,
                validationLibrary: ValidationLibrary.NONE,
                emptySchemaStrategy: EmptySchemaStrategy.KEEP,
            },
            { getExpectedOutputFilesArray: () => Array.from(expected) },
            leaves
        );

        assert.deepEqual(delta, []);
    });

    test('returns only paths registered during the write', async () => {
        const expected = new Set<string>(['/pre-existing.ts']);
        const adapter: CoreOutputAdapter = {
            writeOutputFile: mock.fn(async (file: string) => {
                expected.add(file);
                return 'written';
            }),
            registerLintTarget: mock.fn(),
            logger: { info: mock.fn(), warn: mock.fn() },
        };
        const noop = mock.fn(async () => {});
        const leaves = {
            writeClientCore: noop,
            writeClientCoreIndex: noop,
            writeClientServices: noop,
            writeClientServicesIndex: noop,
            writeClientExecutor: noop,
            writeClientSchemas: mock.fn(async (a: CoreOutputAdapter) => {
                await a.writeOutputFile('/new-schema.ts', '{}');
                return [];
            }),
            writeClientSchemasIndex: noop,
            writeClientModels: mock.fn(async (a: CoreOutputAdapter) => {
                await a.writeOutputFile('/new-model.ts', '{}');
            }),
            writeClientModelsIndex: noop,
        } as unknown as WriteClientArtifactsLeaves;

        const delta = await writeClientArtifacts(
            adapter,
            { register: mock.fn() },
            {
                client: { version: '1', server: 'http://localhost', models: [], services: [] },
                templates: {} as never,
                outputPaths: getOutputPaths({ output: './delta-new' }),
                httpClient: HttpClient.FETCH,
                useOptions: false,
                useUnionTypes: false,
                excludeCoreServiceFiles: true,
                validationLibrary: ValidationLibrary.ZOD,
                emptySchemaStrategy: EmptySchemaStrategy.KEEP,
            },
            { getExpectedOutputFilesArray: () => Array.from(expected) },
            leaves
        );

        assert.deepEqual(delta.sort(), ['/new-model.ts', '/new-schema.ts'].sort());
        assert.ok(expected.has('/pre-existing.ts'));
    });
});
