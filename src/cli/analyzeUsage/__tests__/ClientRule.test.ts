import assert from 'node:assert';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

import { ProjectContext } from '../../../core/projectProbe';
import { createTempDir } from '../../../test/helpers/createTempDir';
import { ClientRule } from '../rules/ClientRule';
import type { Contract } from '../types';
import { createApiImportScope } from '../utils/apiImportScope';

describe('@unit: ClientRule', () => {
    test('tracks createClient usage from path-resolved generated entry import', async t => {
        const tempDir = createTempDir(t, 'client-rule-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const entryPath = path.join(apiDir, 'index.ts');
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(entryPath, 'export interface ClientOptions { baseUrl?: string; }\nexport function createClient(_options?: ClientOptions) {}\n');
        writeFileSync(consumerPath, `import { createClient } from '../generated/index';\nconst api = createClient({ baseUrl: 'https://example.com' });\n`);

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

        const findings = await new ClientRule().check(context, contract, stats, apiScope);

        assert.ok(stats.usedMethods.has('createClient'));
        assert.strictEqual(
            findings.some(f => f.id === 'CLIENT_NOT_FOUND'),
            false
        );
    });

    test('warns when no createClient call is found in src', async t => {
        const tempDir = createTempDir(t, 'client-rule-missing-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const entryPath = path.join(apiDir, 'index.ts');
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(entryPath, 'export interface ClientOptions { baseUrl?: string; }\nexport function createClient(_options?: ClientOptions) {}\n');
        writeFileSync(consumerPath, `export const value = 1;\n`);

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

        const findings = await new ClientRule().check(context, contract, stats, apiScope);

        assert.ok(findings.some(f => f.id === 'CLIENT_NOT_FOUND'));
    });
});
