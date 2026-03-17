import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { describe, test } from 'node:test';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { HttpClient } from '../../types/enums/HttpClient.enum';
import { ModelsMode } from '../../types/enums/ModelsMode.enum';
import { Model } from '../../types/shared/Model.model';
import { WriteClient } from '../../WriteClient';
import { templates } from '../__mocks__/templates';

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

    test('writes models.ts for classes mode', async () => {
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

        const originalWriteFile = fileSystemHelpers.writeFile;
        fileSystemHelpers.writeFile = async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        };

        const models: Model[] = [
            {
                export: 'interface',
                name: 'IUser',
                path: 'IUser',
                type: 'IUser',
                base: 'IUser',
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
                rawName: 'IUserRaw',
                dtoName: 'IUserDto',
                dtoGetters: [{ oldName: 'oldName', newName: 'fullName', target: 'this.fullName', confidence: 1 }],
            },
        ];

        const writeClient = new WriteClient();

        await writeClient.writeClientModels({
            models,
            templates,
            outputModelsPath: '/',
            httpClient: HttpClient.FETCH,
            useUnionTypes: false,
            modelsMode: ModelsMode.CLASSES,
            outputCorePath: '../core',
        });

        const wroteModels = writeFileCalls.some(([filePath, content]) => {
            const file = filePath.toString();
            if (!file.endsWith('models.ts')) return false;
            return content.toString().includes('// models:IUserRaw:IUserDto:1');
        });

        assert.ok(wroteModels, 'Expected models.ts to be written for classes mode');

        fileSystemHelpers.writeFile = originalWriteFile;
    });
});
