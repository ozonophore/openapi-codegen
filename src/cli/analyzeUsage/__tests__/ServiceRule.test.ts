import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { ProjectContext } from '../../../core/projectProbe';
import { Scanner } from '../core/Scanner';
import { ServiceRule } from '../rules/ServiceRule';
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

/** Minimal fixture shaped like v3 snapshot output: barrel index, createClient, class-based services. */
function writeV3StyleGeneratedApi(apiDir: string): { entryPath: string; servicePath: string; createClientPath: string } {
    const servicesDir = path.join(apiDir, 'services');
    mkdirSync(servicesDir, { recursive: true });

    const servicePath = path.join(servicesDir, 'SimpleService.ts');
    const createClientPath = path.join(apiDir, 'createClient.ts');
    const entryPath = path.join(apiDir, 'index.ts');

    writeFileSync(
        servicePath,
        `export type RequestConfig = { method: string; path: string };
export type RequestExecutor<TOptions = unknown> = {
    request: <T>(config: RequestConfig, options?: TOptions) => Promise<T>;
};

const getCallWithoutParametersAndResponse = (): RequestConfig => ({
    method: 'GET',
    path: '/api/v{api-version}/simple',
});

export class SimpleService<TOptions = unknown> {
    constructor(private readonly executor: RequestExecutor<TOptions>) {}

    public getCallWithoutParametersAndResponse(options?: TOptions): Promise<void> {
        return this.executor.request<void>(getCallWithoutParametersAndResponse(), options);
    }
}
`
    );

    writeFileSync(
        createClientPath,
        `import { SimpleService } from './services/SimpleService';

export interface ClientOptions {}

export function createClient() {
    const executor = {
        request: async <T>(_config: unknown, _options?: unknown): Promise<T> => undefined as T,
    };

    return {
        SimpleService: new SimpleService(executor),
    };
}
`
    );

    writeFileSync(
        entryPath,
        `export { SimpleService } from './services/SimpleService';
export { ClientOptions, createClient } from './createClient';
`
    );

    return { entryPath, servicePath, createClientPath };
}

describe('@unit: ServiceRule', () => {
    test('tracks service method usage via createClient return keys (v3 snapshot shape)', async t => {
        const tempDir = createTempDir(t, 'service-rule-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const { entryPath } = writeV3StyleGeneratedApi(apiDir);
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(
            consumerPath,
            `import { createClient } from '../generated/index';
const api = createClient();
api.SimpleService.getCallWithoutParametersAndResponse();
`
        );

        const context = new ProjectContext(tempDir);
        const entryFile = context.project.addSourceFileAtPath(entryPath);
        context.project.addSourceFileAtPath(consumerPath);
        const contract = new Scanner(entryFile).scan();
        const apiScope = createApiImportScope(entryPath);
        const stats = { usedMethods: new Set<string>(), usedSchemas: new Set<string>(), usedModels: new Set<string>() };

        assert.ok(contract.services.SimpleService?.some(m => m.name === 'getCallWithoutParametersAndResponse'));
        assert.deepStrictEqual(contract.clientServiceKeys, { SimpleService: 'SimpleService' });

        const findings = await new ServiceRule().check(context, contract, stats, apiScope);

        assert.ok(stats.usedMethods.has('SimpleService.getCallWithoutParametersAndResponse'));
        assert.strictEqual(
            findings.some(f => f.id === 'SERVICE_METHOD_NOT_FOUND'),
            false
        );
    });

    test('reports missing method on valid createClient service key', async t => {
        const tempDir = createTempDir(t, 'service-rule-missing-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const { entryPath } = writeV3StyleGeneratedApi(apiDir);
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(
            consumerPath,
            `import { createClient } from '../generated/index';
const api = createClient();
api.SimpleService.missingMethod();
`
        );

        const context = new ProjectContext(tempDir);
        const entryFile = context.project.addSourceFileAtPath(entryPath);
        context.project.addSourceFileAtPath(consumerPath);
        const contract = new Scanner(entryFile).scan();
        const apiScope = createApiImportScope(entryPath);
        const stats = { usedMethods: new Set<string>(), usedSchemas: new Set<string>(), usedModels: new Set<string>() };

        const findings = await new ServiceRule().check(context, contract, stats, apiScope);

        assert.ok(findings.some(f => f.id === 'SERVICE_METHOD_NOT_FOUND'));
    });
});
