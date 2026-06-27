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

/** Mirrors generated `core/executor/requestExecutor.ts` for runtime-loaded modules. */
interface GeneratedRequestConfig {
    method: string;
    path: string;
    headers?: Record<string, string>;
    query?: Record<string, unknown>;
    body?: unknown;
    requestMediaType?: string;
    responseType?: 'blob';
    cookies?: Record<string, string>;
}

interface GeneratedApiResult<T> {
    url: string;
    ok: boolean;
    status: number;
    statusText: string;
    body: T;
}

interface GeneratedRequestExecutor<TOptions = Record<string, never>> {
    request<TResponse>(config: GeneratedRequestConfig, options?: TOptions): Promise<TResponse>;
    requestRaw<TResponse>(
        config: GeneratedRequestConfig,
        options?: TOptions,
    ): Promise<GeneratedApiResult<TResponse>>;
}

interface GeneratedRequestRecovery<T = unknown> {
    readonly value: T;
}

type GeneratedRequestRecoveryCtor = new <T = unknown>(value: T) => GeneratedRequestRecovery<T>;

type GeneratedRequestInterceptor = (
    config: GeneratedRequestConfig,
) => GeneratedRequestConfig | Promise<GeneratedRequestConfig>;

type GeneratedResponseInterceptor<T = unknown> = (
    response: T,
    context: GeneratedRequestConfig,
) => T | Promise<T>;

type GeneratedErrorInterceptor = (
    error: unknown,
    context: GeneratedRequestConfig,
) => unknown | Promise<unknown>;

type GeneratedWithInterceptors = <TOptions extends Record<string, unknown> = Record<string, never>>(
    executor: GeneratedRequestExecutor<TOptions>,
    interceptors: {
        onRequest?: GeneratedRequestInterceptor[];
        onResponse?: GeneratedResponseInterceptor[];
        onError?: GeneratedErrorInterceptor[];
    },
) => GeneratedRequestExecutor<TOptions>;

interface GeneratedInterceptorRuntime {
    withInterceptors: GeneratedWithInterceptors;
    RequestRecovery: GeneratedRequestRecoveryCtor;
    isRequestRecovery: (value: unknown) => value is GeneratedRequestRecovery;
}

async function loadGeneratedInterceptorRuntime(outputDir: string): Promise<GeneratedInterceptorRuntime> {
    const interceptorsDir = path.join(outputDir, 'core', 'interceptors');
    const interceptorsUrl = pathToFileURL(path.join(interceptorsDir, 'interceptors.ts')).href;
    const withInterceptorsUrl = pathToFileURL(path.join(interceptorsDir, 'withInterceptors.ts')).href;

    // Load interceptors first so withInterceptors reuses the same module instance.
    const interceptorsModule = (await import(interceptorsUrl)) as Pick<
        GeneratedInterceptorRuntime,
        'RequestRecovery' | 'isRequestRecovery'
    >;
    const { withInterceptors } = (await import(withInterceptorsUrl)) as Pick<
        GeneratedInterceptorRuntime,
        'withInterceptors'
    >;

    return { ...interceptorsModule, withInterceptors };
}

describe('@unit: RequestExecutor interceptors runtime', () => {
    test('withInterceptors applies onRequest, onResponse, RequestRecovery and post-request onError context', async (t: TestContext) => {
        silenceLoggers(t);

        const input = path.join(__dirname, 'spec', 'v3.json');
        const outputDir = mkdtempSync(path.join(process.cwd(), 'test', 'generated', 'request-executor-interceptors-'));
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

        const withInterceptorsSource = readFileSync(withInterceptorsPath, 'utf8');
        const interceptorsSource = readFileSync(interceptorsPath, 'utf8');
        assert.ok(withInterceptorsSource.includes('currentConfig = await runRequestInterceptors(config)'));
        assert.ok(withInterceptorsSource.includes('isRequestRecovery(result)'));
        assert.ok(interceptorsSource.includes('export function isRequestRecovery'));

        const { withInterceptors, RequestRecovery, isRequestRecovery } = await loadGeneratedInterceptorRuntime(outputDir);

        const contexts: GeneratedRequestConfig[] = [];
        const baseExecutor: GeneratedRequestExecutor = {
            async request<T>(config: GeneratedRequestConfig): Promise<T> {
                if (config.headers?.['x-fail'] === '1') {
                    throw new Error('boom');
                }
                return 'ok' as T;
            },
            async requestRaw<T>(config: GeneratedRequestConfig): Promise<GeneratedApiResult<T>> {
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
                (config: GeneratedRequestConfig) => ({
                    ...config,
                    headers: { ...config.headers, 'x-auth': 'token' },
                }),
            ],
            onResponse: [
                (response: unknown, context: GeneratedRequestConfig) => {
                    contexts.push(context);
                    return `${response}-wrapped`;
                },
            ],
            onError: [
                (error: unknown, context: GeneratedRequestConfig) => {
                    contexts.push(context);
                    if (error instanceof Error && error.message === 'boom') {
                        return new RequestRecovery('recovered');
                    }
                    throw error;
                },
            ],
        });

        const recovery = new RequestRecovery('probe');
        assert.ok(isRequestRecovery(recovery));

        const recovered = await executor.request<string>({
            method: 'GET',
            path: '/test',
            headers: { 'x-fail': '1' },
        });

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
