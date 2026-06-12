import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { Project } from 'ts-morph';

import type { Contract } from '../types';
import { createApiImportScope, getAllowedExportsForImport, isApiImport } from '../utils/apiImportScope';

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

describe('@unit: apiImportScope', () => {
    test('createApiImportScope resolves entry file and api root directory', () => {
        const scope = createApiImportScope('/project/generated/index.ts');
        assert.strictEqual(scope.entryFilePath, path.resolve('/project/generated/index.ts'));
        assert.strictEqual(scope.apiRootDir, path.resolve('/project/generated') + path.sep);
    });

    test('isApiImport matches entry file and submodules under api root', t => {
        const tempDir = createTempDir(t, 'api-import-scope-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const entryPath = path.join(apiDir, 'index.ts');
        const schemaPath = path.join(apiDir, 'schemas.ts');
        const consumerPath = path.join(srcDir, 'consumer.ts');

        writeFileSync(entryPath, 'export { UserSchema } from "./schemas";\nexport function createClient() {}\n');
        writeFileSync(schemaPath, 'export const UserSchema = {};\n');
        writeFileSync(consumerPath, `import { createClient } from '../generated/index';\nimport { UserSchema } from '../generated/schemas';\nimport { readFileSync } from 'fs';\n`);

        const project = new Project({
            compilerOptions: {
                moduleResolution: 2,
                esModuleInterop: true,
            },
        });
        project.addSourceFileAtPath(entryPath);
        project.addSourceFileAtPath(schemaPath);
        const consumerFile = project.addSourceFileAtPath(consumerPath);
        const scope = createApiImportScope(entryPath);

        const imports = consumerFile.getImportDeclarations();
        assert.strictEqual(isApiImport(imports[0], scope), true);
        assert.strictEqual(isApiImport(imports[1], scope), true);
        assert.strictEqual(isApiImport(imports[2], scope), false);
    });

    test('getAllowedExportsForImport uses contract exports for entry and file exports for submodules', t => {
        const tempDir = createTempDir(t, 'api-import-exports-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const entryPath = path.join(apiDir, 'index.ts');
        const schemaPath = path.join(apiDir, 'schemas.ts');
        const consumerPath = path.join(srcDir, 'consumer.ts');

        writeFileSync(entryPath, 'export { UserSchema } from "./schemas";\nexport function createClient() {}\n');
        writeFileSync(schemaPath, 'export const UserSchema = {};\n');
        writeFileSync(consumerPath, `import { createClient } from '../generated/index';\nimport { UserSchema } from '../generated/schemas';\n`);

        const project = new Project({
            compilerOptions: {
                moduleResolution: 2,
                esModuleInterop: true,
            },
        });
        const entryFile = project.addSourceFileAtPath(entryPath);
        project.addSourceFileAtPath(schemaPath);
        const consumerFile = project.addSourceFileAtPath(consumerPath);
        const scope = createApiImportScope(entryPath);
        const contract: Contract = {
            services: {},
            clientServiceKeys: {},
            schemas: ['UserSchema'],
            models: [],
            sourceFile: entryFile,
        };

        const entryImport = consumerFile.getImportDeclarations()[0];
        const schemaImport = consumerFile.getImportDeclarations()[1];

        const entryExports = getAllowedExportsForImport(entryImport, scope, contract);
        const schemaExports = getAllowedExportsForImport(schemaImport, scope, contract);

        assert.ok(entryExports.has('createClient'));
        assert.ok(entryExports.has('UserSchema'));
        assert.ok(schemaExports.has('UserSchema'));
        assert.strictEqual(schemaExports.has('createClient'), false);
    });
});
