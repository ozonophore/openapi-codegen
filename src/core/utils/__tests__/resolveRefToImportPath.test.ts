import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';

import { resolveRefToImportPath } from '../resolveRefToImportPath';

// Normalization of paths for cross-platform
const normalizePath = (p: string) => p.replace(/\\/g, '/');

describe('@unit resolveRefToImportPath — correctly resolves links to components', () => {
    const mainSpecPath = '/Users/user/Developer/my_app/openapi/app/openapi_spec.yaml';
    const outputModelsPath = '/Users/user/Developer/openapi-codegen/generated/account/models';

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

    test('external link to the file → correct name via getClassName', () => {
        const result = resolveRefToImportPath({
            mainSpecPath,
            parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/accountSpec.yaml',
            refValuePath: './users-list.yaml',
            outputModelsPath,
        });

        // users-list.yaml → UsersList (по твоей логике stripNamespace + getClassName)
        assert.equal(normalizePath(result), './spec/UsersList');
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

    test('the link to the file without the extension → is processed correctly', () => {
        const result = resolveRefToImportPath({
            mainSpecPath,
            parentFilePath: '/Users/user/Developer/my_app/openapi/app/spec/shared.yaml',
            refValuePath: './common/error',
            outputModelsPath,
        });

        // error → Error (getClassName)
        assert.equal(normalizePath(result), './spec/common/Error');
    });
});