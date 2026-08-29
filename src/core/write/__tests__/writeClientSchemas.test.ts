import assert from 'node:assert';
import { mkdtempSync } from 'node:fs';
import { PathOrFileDescriptor } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { rmTempDir } from '../../../test/helpers/rmTempDir';
import { EmptySchemaStrategy } from '../../types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../../types/enums/ValidationLibrary.enum';
import { Model } from '../../types/shared/Model.model';
import { templates } from '../../utils/__mocks__/templates';
import { WriteClient } from '../WriteClient';
import { writeClientSchemas } from '../writeClientSchemas';

describe('@unit: writeClientSchemas', () => {
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

        const adapter = new WriteClient().toCoreOutputAdapter();
        const outputSchemasPath = mkdtempSync(join(tmpdir(), 'openapi-codegen-schemas-'));

        try {
            await writeClientSchemas(adapter, {
                models,
                templates,
                outputSchemasPath,
                httpClient: HttpClient.FETCH,
                useUnionTypes: false,
                validationLibrary: ValidationLibrary.NONE,
                emptySchemaStrategy: EmptySchemaStrategy.KEEP,
            });

            assert.ok(
                writeFileCalls.some(([filePath, content]) => filePath.toString().includes('MyModelSchema.ts') && content.toString().includes('schema')),
                'Expected writeFile to be called with schema content for MyModelSchema.ts'
            );
        } finally {
            fileSystemHelpers.writeFile = originalWriteFile;
            rmTempDir(outputSchemasPath);
        }
    });

    test('refuses POSIX drive-root output path', async () => {
        const adapter = new WriteClient().toCoreOutputAdapter();
        await assert.rejects(
            () =>
                writeClientSchemas(adapter, {
                    models: [],
                    templates,
                    outputSchemasPath: '/',
                    httpClient: HttpClient.FETCH,
                    useUnionTypes: false,
                    validationLibrary: ValidationLibrary.NONE,
                    emptySchemaStrategy: EmptySchemaStrategy.KEEP,
                }),
            /drive root/
        );
    });

    test('refuses Windows drive-root output path', async () => {
        const adapter = new WriteClient().toCoreOutputAdapter();
        await assert.rejects(
            () =>
                writeClientSchemas(adapter, {
                    models: [],
                    templates,
                    outputSchemasPath: 'D:\\',
                    httpClient: HttpClient.FETCH,
                    useUnionTypes: false,
                    validationLibrary: ValidationLibrary.NONE,
                    emptySchemaStrategy: EmptySchemaStrategy.KEEP,
                }),
            /drive root/
        );
    });
});
