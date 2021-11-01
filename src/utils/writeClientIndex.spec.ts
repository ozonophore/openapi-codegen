import type { Client } from '../client/interfaces/Client';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientIndex } from './writeClientIndex';

const os = require('os');

jest.mock('./fileSystem');

describe('writeClientIndex', () => {
    it('should write to filesystem', async () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: '1.0',
            models: [],
            services: [],
        };

        const templates: Templates = {
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
            },
        };

        await writeClientIndex({ client, templates, outputPath: '/', useUnionTypes: true, exportSchemas: true, exportCore: true, exportModels: true, exportServices: true });

        if (os.platform() == 'win32' || os.platform() == 'win64') {
            expect(writeFile).toBeCalledWith('D:\\index.ts', 'index');
        } else {
            expect(writeFile).toBeCalledWith('/index.ts', 'index');
        }
    });
});
