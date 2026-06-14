import assert from 'node:assert';
import { describe, test, type TestContext } from 'node:test';

import { existsSync, readFileSync, rmSync } from 'fs';
import path from 'path';

import { generate, HttpClient } from '../src';
import { ValidationLibrary } from '../src/core/types/enums/ValidationLibrary.enum';
import { silenceLoggers } from '../src/test/helpers/silenceLoggers';

const repoRoot = path.join(__dirname, '..');
if (process.cwd() !== repoRoot) {
    process.chdir(repoRoot);
}

describe('@unit: custom request + requestRaw', () => {
    test('maps RequestConfig to legacy transport and generates requestRaw methods', async (t: TestContext) => {
        silenceLoggers(t);

        const input = path.join(__dirname, 'spec', 'v3.json');
        const outputDir = path.join(process.cwd(), 'test', 'generated', 'custom_request_raw');
        t.after(() => {
            rmSync(outputDir, { recursive: true, force: true });
        });

        await generate({
            input,
            output: outputDir,
            request: './test/custom/request.ts',
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

        const createClient = readFileSync(path.join(outputDir, 'createClient.ts'), 'utf8');
        const responseService = readFileSync(path.join(outputDir, 'services', 'ResponseService.ts'), 'utf8');
        const createExecutorAdapter = readFileSync(path.join(outputDir, 'core', 'executor', 'createExecutorAdapter.ts'), 'utf8');
        const legacyAdapter = readFileSync(path.join(outputDir, 'core', 'executor', 'legacyRequestAdapter.ts'), 'utf8');

        assert.ok(createClient.includes('withInterceptors'));
        assert.ok(createClient.includes('apiErrorInterceptor'));
        assert.ok(responseService.includes('requestRaw<'));
        assert.ok(createExecutorAdapter.includes('toApiRequestOptions'));
        assert.ok(createExecutorAdapter.includes('__requestRaw<TResponse>(toMergedOptions(config, options), openApiConfig)'));
        assert.ok(legacyAdapter.includes('createLegacyRequestAdapter'));
        assert.ok(legacyAdapter.includes('legacyRequestRaw'));
    });
});

describe('@unit: customExecutorPath wiring', () => {
    test('copies custom createExecutorAdapter into core and wires createClient.ts', async (t: TestContext) => {
        silenceLoggers(t);

        const input = path.join(__dirname, 'spec', 'v3.json');
        const outputDir = path.join(process.cwd(), 'test', 'generated', 'custom_executor_path');
        const adapterPath = './test/custom/createExecutorAdapter.ts';
        const copiedAdapterPath = path.join(outputDir, 'core', 'executor', 'createExecutorAdapter.ts');
        t.after(() => {
            rmSync(outputDir, { recursive: true, force: true });
        });

        await generate({
            input,
            output: outputDir,
            customExecutorPath: adapterPath,
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

        const createClient = readFileSync(path.join(outputDir, 'createClient.ts'), 'utf8');
        const copiedAdapter = readFileSync(copiedAdapterPath, 'utf8');

        assert.ok(existsSync(copiedAdapterPath));
        assert.ok(createClient.includes("from './core/executor/createExecutorAdapter'"));
        assert.ok(createClient.includes('createExecutorAdapter<TExecutorOptions>(openApiConfig)'));
        assert.ok(copiedAdapter.includes('transportRequestRaw<TResponse>(toMergedOptions(config, options), openApiConfig)'));
        assert.ok(!copiedAdapter.includes('__requestRaw'));
    });
});
