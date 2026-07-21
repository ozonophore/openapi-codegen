import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { PathOrFileDescriptor } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { HttpClient } from '../../types/enums/HttpClient.enum';
import { ModelsLayout } from '../../types/enums/ModelsLayout.enum';
import { ModelsMode } from '../../types/enums/ModelsMode.enum';
import { Model } from '../../types/shared/Model.model';
import { WriteClient } from '../../WriteClient';
import { templates } from '../__mocks__/templates';
import { resolvePerFileOutputCore } from '../writeClientModels';

describe('@unit: writeClientModels', () => {
    test('resolvePerFileOutputCore nests ../ for deeper model paths', () => {
        assert.strictEqual(resolvePerFileOutputCore('../core', 'User'), '../core');
        assert.strictEqual(resolvePerFileOutputCore('../core', 'schemas/User'), '../../core');
        assert.strictEqual(resolvePerFileOutputCore('../core', 'path/alias_request/Simple'), '../../../core');
    });
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

    test('writes per-path files for classes mode with per-file layout', async () => {
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];

        const originalWriteFile = fileSystemHelpers.writeFile;
        fileSystemHelpers.writeFile = async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        };

        const models: Model[] = [
            {
                export: 'interface',
                name: 'IUser',
                path: 'User',
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
            },
            {
                export: 'interface',
                name: 'IProfile',
                path: 'Profile',
                type: 'IProfile',
                base: 'IProfile',
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
                rawName: 'IProfileRaw',
                dtoName: 'IProfileDto',
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
            modelsLayout: ModelsLayout.PER_FILE,
            outputCorePath: '../core',
        });

        const wroteUser = writeFileCalls.some(([filePath, content]) => {
            return filePath.toString().endsWith('User.ts') && content.toString().includes('// classesModel:User:IUserRaw:IUserDto');
        });
        const wroteProfile = writeFileCalls.some(([filePath, content]) => {
            return filePath.toString().endsWith('Profile.ts') && content.toString().includes('// classesModel:Profile:IProfileRaw:IProfileDto');
        });
        const wroteBundle = writeFileCalls.some(([filePath]) => filePath.toString().endsWith('models.ts'));

        assert.ok(wroteUser, 'Expected User.ts for per-file classes layout');
        assert.ok(wroteProfile, 'Expected Profile.ts for per-file classes layout');
        assert.ok(!wroteBundle, 'Expected no models.ts bundle for per-file layout');

        fileSystemHelpers.writeFile = originalWriteFile;
    });

    test('passes nested-relative outputCore for deep per-file model paths', async () => {
        const writeFileCalls: Array<[PathOrFileDescriptor, string | NodeJS.ArrayBufferView]> = [];
        const originalWriteFile = fileSystemHelpers.writeFile;
        fileSystemHelpers.writeFile = async (path: PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) => {
            writeFileCalls.push([path, content]);
        };

        const models: Model[] = [
            {
                export: 'interface',
                name: 'ISimple',
                path: 'path/alias_request/Simple',
                type: 'ISimple',
                base: 'ISimple',
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
                rawName: 'ISimpleRaw',
                dtoName: 'ISimpleDto',
            },
        ];

        const outputModelsPath = mkdtempSync(join(tmpdir(), 'openapi-codegen-models-'));
        const writeClient = new WriteClient();
        try {
            await writeClient.writeClientModels({
                models,
                templates,
                outputModelsPath,
                httpClient: HttpClient.FETCH,
                useUnionTypes: false,
                modelsMode: ModelsMode.CLASSES,
                modelsLayout: ModelsLayout.PER_FILE,
                outputCorePath: '../core',
            });

            const wrote = writeFileCalls.find(([filePath]) => filePath.toString().endsWith('Simple.ts'));
            assert.ok(wrote, 'Expected nested Simple.ts');
            assert.ok(wrote![1].toString().includes('core=../../../core'), `Expected nested outputCore, got: ${wrote![1].toString()}`);
        } finally {
            fileSystemHelpers.writeFile = originalWriteFile;
            rmSync(outputModelsPath, { recursive: true, force: true });
        }
    });
});
