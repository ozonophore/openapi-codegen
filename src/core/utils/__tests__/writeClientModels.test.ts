import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { mock, test } from 'node:test';

import { HttpClient } from '../../types/Enums';
import { Model } from '../../types/shared/Model.model';
import { fileSystem } from '../fileSystem';
import { writeClientModels } from '../writeClientModels';

test('@unit: writeClientModels writes to filesystem', async () => {
    const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

    // Переприсваиваем функцию вручную с моком
    const originalWriteFile = fileSystem.writeFile;
    fileSystem.writeFile = mock.fn(async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
        writeFileCalls.push([path, content]);
    });

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

    await writeClientModels({
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

    // Восстанавливаем оригинальную функцию
    fileSystem.writeFile = originalWriteFile;
});
