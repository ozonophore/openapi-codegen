import assert from 'node:assert';
import { describe, test, type TestContext } from 'node:test';

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { pathToFileURL } from 'url';

import { generate, HttpClient } from '../src';
import { ValidationLibrary } from '../src/core/types/enums/ValidationLibrary.enum';
import { silenceLoggers } from '../src/test/helpers/silenceLoggers';

const repoRoot = path.join(__dirname, '..');
if (process.cwd() !== repoRoot) {
    process.chdir(repoRoot);
}

type RequestConfig = {
    method: string;
    path: string;
    headers?: Record<string, string>;
};

describe('@unit: RequestExecutor interceptors runtime', () => {
    test('withInterceptors applies onRequest, onResponse, RequestRecovery and post-request onError context', async (t: TestContext) => {
        silenceLoggers(t);

        const input = path.join(__dirname, 'spec', 'v3.json');
        const outputDir = path.join(process.cwd(), 'test', 'generated', 'request_executor_interceptors');
        t.after(() => {
            rmSync(outputDir, { recursive: true, force: true });
        });

        await generate({
            input,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            validationLibrary: ValidationLibrary.NONE,
            enumPrefix: 'E',
            excludeCoreServiceFiles: false,
            interfacePrefix: 'I',
            sortByRequired: true,
            typePrefix: 'T',
            useCancelableRequest: false,
            useSeparatedIndexes: false,
        });

        const withInterceptorsPath = path.join(outputDir, 'core', 'interceptors', 'withInterceptors.ts');
        const interceptorsPath = path.join(outputDir, 'core', 'interceptors', 'interceptors.ts');

        const source = readFileSync(withInterceptorsPath, 'utf8');
        assert.ok(source.includes('currentConfig = await runRequestInterceptors(config)'));
        assert.ok(source.includes('result instanceof RequestRecovery'));

        const { withInterceptors } = await import(pathToFileURL(withInterceptorsPath).href);
        const { RequestRecovery } = await import(pathToFileURL(interceptorsPath).href);

        const contexts: Array<{ headers?: Record<string, string> }> = [];
        const baseExecutor = {
            async request<T>(config: RequestConfig): Promise<T> {
                if (config.headers?.['x-fail'] === '1') {
                    throw new Error('boom');
                }
                return 'ok' as T;
            },
            async requestRaw<T>(config: RequestConfig) {
                return {
                    url: config.path,
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    body: 'raw' as T,
                };
            },
        };

        const executor = withInterceptors(baseExecutor, {
            onRequest: [
                (config) => ({
                    ...config,
                    headers: { ...config.headers, 'x-auth': 'token' },
                }),
            ],
            onResponse: [
                (response, context) => {
                    contexts.push(context);
                    return `${response}-wrapped`;
                },
            ],
            onError: [
                (error, context) => {
                    contexts.push(context);
                    if (error instanceof Error && error.message === 'boom') {
                        return new RequestRecovery('recovered');
                    }
                    throw error;
                },
            ],
        });

        const recovered = await executor.request({
            method: 'GET',
            path: '/test',
            headers: { 'x-fail': '1' },
        } as RequestConfig);

        assert.strictEqual(recovered, 'recovered-wrapped');
        assert.strictEqual(contexts.length, 2);
        assert.strictEqual(contexts[0]?.headers?.['x-auth'], 'token');
        assert.strictEqual(contexts[1]?.headers?.['x-auth'], 'token');
    });
});

describe('@unit: validateExecutorSetup', () => {
    test('warns when customExecutorPath file is missing or lacks createExecutorAdapter export', async () => {
        const { validateExecutorSetup } = await import('../src/cli/checkAndUpdateConfig/utils/validateExecutorSetup');

        const dir = mkdtempSync(path.join(tmpdir(), 'executor-setup-'));
        const adapterFile = path.join(dir, 'adapter.ts');
        writeFileSync(adapterFile, 'export const foo = 1;\n');

        const warnings = validateExecutorSetup(
            {
                customExecutorPath: adapterFile,
            },
            dir,
        );

        assert.ok(warnings.some(w => w.includes('should export function createExecutorAdapter')));

        const missingWarnings = validateExecutorSetup(
            {
                customExecutorPath: './missing-adapter.ts',
            },
            dir,
        );

        assert.ok(missingWarnings.some(w => w.includes('file not found')));
    });
});
