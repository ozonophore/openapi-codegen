import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { ProjectContext } from '../../../core/projectProbe';
import { ImportRule } from '../rules/ImportRule';
import type { Contract } from '../types';
import { createApiImportScope } from '../utils/apiImportScope';

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

describe('@unit: ImportRule', () => {
    test('reports invalid import name for unresolved export from generated entry', async t => {
        const tempDir = createTempDir(t, 'import-rule-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const entryPath = path.join(apiDir, 'index.ts');
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(entryPath, 'export function createClient() {}\n');
        writeFileSync(consumerPath, `import { createClinet } from '../generated/index';\n`);

        const context = new ProjectContext(tempDir);
        const entryFile = context.project.addSourceFileAtPath(entryPath);
        context.project.addSourceFileAtPath(consumerPath);
        const contract: Contract = {
            services: {},
            clientServiceKeys: {},
            schemas: [],
            models: [],
            sourceFile: entryFile,
        };
        const apiScope = createApiImportScope(entryPath);
        const stats = { usedMethods: new Set<string>(), usedSchemas: new Set<string>(), usedModels: new Set<string>() };

        const findings = await new ImportRule().check(context, contract, stats, apiScope);

        assert.ok(findings.some(f => f.id === 'INVALID_IMPORT_NAME' && f.context?.suggestion === 'createClient'));
    });

    test('accepts valid imports resolved to generated entry', async t => {
        const tempDir = createTempDir(t, 'import-rule-valid-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const entryPath = path.join(apiDir, 'index.ts');
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(entryPath, 'export function createClient() {}\n');
        writeFileSync(consumerPath, `import { createClient } from '../generated/index';\n`);

        const context = new ProjectContext(tempDir);
        const entryFile = context.project.addSourceFileAtPath(entryPath);
        context.project.addSourceFileAtPath(consumerPath);
        const contract: Contract = {
            services: {},
            clientServiceKeys: {},
            schemas: [],
            models: [],
            sourceFile: entryFile,
        };
        const apiScope = createApiImportScope(entryPath);
        const stats = { usedMethods: new Set<string>(), usedSchemas: new Set<string>(), usedModels: new Set<string>() };

        const findings = await new ImportRule().check(context, contract, stats, apiScope);

        assert.strictEqual(findings.length, 0);
    });
});
