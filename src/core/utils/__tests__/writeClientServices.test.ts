import assert from 'node:assert';
import { PathOrFileDescriptor } from 'node:fs';
import { mock, test } from 'node:test';

import { HttpClient } from '../../types/Enums';
import { Service } from '../../types/shared/Service.model';
import { fileSystem } from '../fileSystem';
import { writeClientServices } from '../writeClientServices';

test('@unit: writeClientServices  writes to filesystem', async () => {
    const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

    // Переприсваиваем функцию вручную с моком
    const originalWriteFile = fileSystem.writeFile;
    fileSystem.writeFile = mock.fn(async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
        writeFileCalls.push([path, content]);
    });

    const services: Service[] = [
        {
            name: 'MyService',
            originName: 'MyService',
            operations: [],
            imports: [],
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
    await writeClientServices({
        services,
        templates,
        outputPaths: {
            outputCore: '/',
            outputModels: '/',
            outputServices: '/',
        },
        httpClient: HttpClient.FETCH,
        useUnionTypes: false,
        useOptions: false,
        useCancelableRequest: false,
    });

    assert.ok(
        writeFileCalls.some(([filePath, content]) => filePath.toString().includes('MyService.ts') && content.toString().includes('service')),
        'Expected writeFile to be called with service content for MyService.ts'
    );

    // Восстанавливаем оригинальную функцию
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fileSystem.writeFile = originalWriteFile;
});
