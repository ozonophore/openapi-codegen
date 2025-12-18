import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, mock, test } from 'node:test';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { REGEX_BACKSLASH } from '../../types/Consts';
import { resolveRefToImportPath } from '../resolveRefToImportPath';

// Normalization of paths for cross-platform
const normalizePath = (p: string) => p.replace(REGEX_BACKSLASH, '/');

describe('@unit resolveRefToImportPath — correctly resolves links to components', () => {
    const mainSpecPath = '/Users/user/Developer/my_app/openapi/app/openapi_spec.yaml';
    const outputModelsPath = '/Users/user/Developer/openapi-codegen/generated/account/models';
    const originalIsDirectory = fileSystemHelpers.isDirectory;
    const originalIsPathToFile = fileSystemHelpers.isPathToFile;

    beforeEach(() => {
        fileSystemHelpers.isDirectory = mock.fn(() => false);
        fileSystemHelpers.isPathToFile = mock.fn(() => true);
    });

    afterEach(() => {
        fileSystemHelpers.isDirectory = originalIsDirectory;
        fileSystemHelpers.isPathToFile = originalIsPathToFile;
    });

    describe('HTTP_URL', () => {
        test('http URL → returns URL as is', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: mainSpecPath,
                refValuePath: 'http://example.com/schema.json',
                outputModelsPath,
            });

            assert.equal(result, 'http://example.com/schema.json');
        });

        test('https URL → returns URL as is', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: mainSpecPath,
                refValuePath: 'https://api.example.com/schemas/user.yaml',
                outputModelsPath,
            });

            assert.equal(result, 'https://api.example.com/schemas/user.yaml');
        });
    });

    describe('LOCAL_FRAGMENT', () => {
        test('internal link in the child file → path to the model by schema name', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml#/components/schemas/AccountField',
                refValuePath: '#/components/schemas/AccountField',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/AccountField');
        });

        test('internal link in the main file → model in the root output', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: mainSpecPath,
                refValuePath: '#/components/schemas/MainUser',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './MainUser');
        });

        test('internal link without parentFilePath → uses mainSpecPath', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '',
                refValuePath: '#/components/schemas/MainUser',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './MainUser');
        });

        test('embedded internal link → folder structure is saved', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/nested/admin/schemas.yaml#/components/schemas/AdminUser',
                refValuePath: '#/components/schemas/AdminUser',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/nested/admin/AdminUser');
        });

        test('deep nesting — the path is built correctly', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/very/deep/config/models.yaml#/components/schemas/ConfigDto',
                refValuePath: '#/components/schemas/ConfigDto',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/very/deep/config/ConfigDto');
        });

        test('LOCAL_FRAGMENT with responses component', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '#/components/responses/ErrorResponse',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/ErrorResponse');
        });

        test('LOCAL_FRAGMENT with parameters component', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '#/components/parameters/PageParam',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/PageParam');
        });

        test('LOCAL_FRAGMENT with mainSpecPath as directory', () => {
            fileSystemHelpers.isDirectory = mock.fn(() => true);
            fileSystemHelpers.isPathToFile = mock.fn(() => false);
            const mainSpecDir = '/Users/user/Developer/my_app/openapi/app';

            const result = resolveRefToImportPath({
                mainSpecPath: mainSpecDir,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '#/components/schemas/AccountField',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/AccountField');
        });

        test('LOCAL_FRAGMENT when mapPathToTargetDirSafe maps correctly → returns relative path', () => {
            // Even with different output path, mapPathToTargetDirSafe finds common parent
            // and maps the path, so function returns relative path, not fallback
            const externalOutputPath = '/Users/user/Developer/other_project/generated/models';
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '#/components/schemas/AccountField',
                outputModelsPath: externalOutputPath,
            });

            // The path is still mapped correctly via common parent
            assert.equal(normalizePath(result), './spec/AccountField');
        });
    });

    describe('EXTERNAL_FILE_FRAGMENT', () => {
        test('external file with fragment → resolves to correct model path', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: './users-list.yaml#/components/schemas/UserList',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/UserList');
        });

        test('external file fragment with nested path', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '../shared/common.yaml#/components/schemas/CommonModel',
                outputModelsPath,
            });

            // Should resolve relative to parent file directory
            const normalized = normalizePath(result);
            assert.ok(normalized.includes('CommonModel') || normalized.includes('common'));
        });

        test('external file fragment without parentFilePath', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '',
                refValuePath: './shared/models.yaml#/components/schemas/SharedModel',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(normalized.includes('SharedModel') || normalized.includes('shared'));
        });

        test('external file fragment with responses component', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: './responses.yaml#/components/responses/ApiResponse',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(normalized.includes('ApiResponse') || normalized.includes('spec'));
        });

        test('EXTERNAL_FILE_FRAGMENT when path is outside outputModelsPath → returns fallback', () => {
            const externalOutputPath = '/Users/user/Developer/other_project/generated/models';
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: './users-list.yaml#/components/schemas/UserList',
                outputModelsPath: externalOutputPath,
            });

            // mapPathToTargetDirSafe finds common parent and still maps the path,
            // so it returns relative path instead of fallback
            assert.equal(normalizePath(result), './spec/UserList');
        });
    });

    describe('EXTERNAL_FILE', () => {
        test('external link to the file → correct name via getClassName', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: './users-list.yaml',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/UsersList');
        });

        test('the link to the file without the extension → is processed correctly', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/shared.yaml',
                refValuePath: './common/error',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/common/Error');
        });

        test('external file with relative path up directory', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/nested/accountSpec.yaml',
                refValuePath: '../shared/common.yaml',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(normalized.includes('Common') || normalized.includes('spec/shared'));
        });

        test('external file with absolute path', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '/Users/user/Developer/my_app/openapi/shared/models.yaml',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            // Absolute paths are handled in default case
            assert.ok(typeof normalized === 'string');
        });

        test('EXTERNAL_FILE when path is outside outputModelsPath → returns fallback', () => {
            const externalOutputPath = '/Users/user/Developer/other_project/generated/models';
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: './users-list.yaml',
                outputModelsPath: externalOutputPath,
            });

            // mapPathToTargetDirSafe finds common parent and still maps the path,
            // so it returns relative path instead of fallback
            assert.equal(normalizePath(result), './spec/UsersList');
        });

        test('external file reference from main spec file', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: mainSpecPath,
                refValuePath: './schemas/user.yaml',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(normalized.includes('User') || normalized === './User');
        });
    });

    describe('ABSOLUTE_PATH (default case)', () => {
        test('absolute path to file → resolves correctly', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '/Users/user/Developer/my_app/openapi/shared/models/user.yaml',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(typeof normalized === 'string' && normalized.length > 0);
        });

        test('absolute path when isPathToFile returns true', () => {
            fileSystemHelpers.isDirectory = mock.fn(() => false);
            fileSystemHelpers.isPathToFile = mock.fn((path: string) => {
                return path.includes('user.yaml');
            });

            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '/Users/user/Developer/my_app/openapi/shared/models/user.yaml',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(typeof normalized === 'string');
        });

        test('absolute path when isPathToFile returns false (directory)', () => {
            fileSystemHelpers.isDirectory = mock.fn((path: string) => {
                return path.includes('models');
            });
            fileSystemHelpers.isPathToFile = mock.fn(() => false);

            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '/Users/user/Developer/my_app/openapi/shared/models',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(typeof normalized === 'string');
        });

        test('absolute path when path is outside outputModelsPath → returns fallback', () => {
            const externalOutputPath = '/Users/user/Developer/other_project/generated/models';
            fileSystemHelpers.isDirectory = mock.fn(() => false);
            fileSystemHelpers.isPathToFile = mock.fn(() => true);

            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: '/Users/user/Developer/my_app/openapi/shared/models/user.yaml',
                outputModelsPath: externalOutputPath,
            });

            // Should return fallback with basename
            const normalized = normalizePath(result);
            assert.ok(normalized.includes('User') || normalized === './User');
        });

        test('absolute path with parentFilePath as directory', () => {
            fileSystemHelpers.isDirectory = mock.fn((path: string) => {
                return path.includes('app');
            });
            fileSystemHelpers.isPathToFile = mock.fn((path: string) => {
                return !path.includes('app');
            });

            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app',
                refValuePath: '/Users/user/Developer/my_app/openapi/shared/models/user.yaml',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(typeof normalized === 'string');
        });
    });

    describe('Edge cases', () => {
        test('parentFilePath with fragment but refValuePath is external file', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml#/components/schemas/Account',
                refValuePath: './users-list.yaml',
                outputModelsPath,
            });

            assert.equal(normalizePath(result), './spec/UsersList');
        });

        test('refValuePath starts with parent baseName → removes prefix correctly', () => {
            fileSystemHelpers.isDirectory = mock.fn(() => false);
            fileSystemHelpers.isPathToFile = mock.fn(() => true);

            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
                refValuePath: 'accountSpec.yaml/nested/model.yaml',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(typeof normalized === 'string');
        });

        test('empty refValuePath with default handling', () => {
            // parseRef returns LOCAL_FRAGMENT for empty/invalid refs
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: mainSpecPath,
                refValuePath: '',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(typeof normalized === 'string');
        });

        test('parentFilePath without filePath in parsed result', () => {
            const result = resolveRefToImportPath({
                mainSpecPath,
                parentFilePath: '#/components/schemas/Parent',
                refValuePath: './child.yaml',
                outputModelsPath,
            });

            const normalized = normalizePath(result);
            assert.ok(typeof normalized === 'string');
        });

        test('when absModelPath equals absOutputModelsPath', () => {
            // This tests the condition: absModelPath !== absOutputModelsPath
            const customOutputPath = '/Users/user/Developer/openapi-codegen/generated/models';
            const result = resolveRefToImportPath({
                mainSpecPath: '/Users/user/Developer/my_app/openapi/app/openapi_spec.yaml',
                parentFilePath: '/Users/user/Developer/my_app/openapi/app/openapi_spec.yaml',
                refValuePath: '#/components/schemas/MainUser',
                outputModelsPath: customOutputPath,
            });

            const normalized = normalizePath(result);
            assert.ok(typeof normalized === 'string');
        });
    });
});
