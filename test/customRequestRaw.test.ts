import assert from 'node:assert';
import { describe, test, type TestContext } from 'node:test';

import { readFileSync, rmSync } from 'fs';
import path from 'path';

import { generate, HttpClient } from '../src';
import { ValidationLibrary } from '../src/core/types/enums/ValidationLibrary.enum';

const repoRoot = path.join(__dirname, '..');
if (process.cwd() !== repoRoot) {
    process.chdir(repoRoot);
}

describe('@unit: custom request + requestRaw smoke', () => {
    test('generates requestRaw methods with custom request implementation', async (t: TestContext) => {
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
        const coreRequest = readFileSync(path.join(outputDir, 'core', 'request.ts'), 'utf8');

        assert.ok(createClient.includes('createExecutorAdapter'));
        assert.ok(responseService.includes('requestRaw<'));
        assert.ok(createExecutorAdapter.includes('return __request(config, options) as Promise<ApiResult<TResponse>>;'));
        assert.ok(coreRequest.includes('export function request<T>(config: TOpenAPIConfig, options: ApiRequestOptions): Promise<T>'));
    });
});
