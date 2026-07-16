import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { generateOpenApiClient } from '../../../cli/generateOpenApiClient/generateOpenApiClient';
import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

function writeMinimalSpec(filePath: string, serverUrl: string, title: string): void {
    writeFileSync(
        filePath,
        JSON.stringify({
            openapi: '3.0.3',
            info: { title, version: '1.0.0' },
            servers: [{ url: serverUrl }],
            paths: {
                '/ping': {
                    get: {
                        operationId: 'ping',
                        responses: {
                            '200': {
                                description: 'ok',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { ok: { type: 'boolean' } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })
    );
}

function isStub(content: string): boolean {
    return /^\s*export \* from '/.test(content);
}

describe('@unit: reuseMode shared core integration', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('4.1 root request + auto-group shares ApiError and request under __shared__/core', async t => {
        const tempDir = createTempDir(t, 'shared-core-root-');
        const previousCwd = process.cwd();
        process.chdir(tempDir);
        t.after(() => process.chdir(previousCwd));

        writeMinimalSpec(path.join(tempDir, 'a.json'), 'https://a.example.com', 'Service A');
        writeMinimalSpec(path.join(tempDir, 'b.json'), 'https://b.example.com', 'Service B');
        writeFileSync(path.join(tempDir, 'custom-request.ts'), 'export async function request() { return "shared"; }\n');

        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                cache: true,
                cacheStrategy: 'reuse',
                cachePath: './.store',
                reuseMode: 'auto-group',
                request: './custom-request.ts',
                items: [
                    { input: './a.json', output: './out/api-a' },
                    { input: './b.json', output: './out/api-b' },
                ],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.equal(result.success, true, result.error);

        const sharedApiError = path.join(tempDir, 'out', '__shared__', 'core', 'ApiError.ts');
        const sharedRequest = path.join(tempDir, 'out', '__shared__', 'core', 'request.ts');
        assert.ok(existsSync(sharedApiError), 'expected shared ApiError');
        assert.ok(existsSync(sharedRequest), 'expected shared request');
        assert.ok(!isStub(readFileSync(sharedApiError, 'utf8')));
        assert.match(readFileSync(sharedRequest, 'utf8'), /shared/);

        for (const item of ['api-a', 'api-b']) {
            const apiError = readFileSync(path.join(tempDir, 'out', item, 'core', 'ApiError.ts'), 'utf8');
            const request = readFileSync(path.join(tempDir, 'out', item, 'core', 'request.ts'), 'utf8');
            assert.ok(isStub(apiError), `${item} ApiError should be stub`);
            assert.ok(isStub(request), `${item} request should be stub`);
        }
    });

    test('4.2 per-item request override does not stub onto the other item request', async t => {
        const tempDir = createTempDir(t, 'shared-core-override-');
        const previousCwd = process.cwd();
        process.chdir(tempDir);
        t.after(() => process.chdir(previousCwd));

        writeMinimalSpec(path.join(tempDir, 'a.json'), 'https://a.example.com', 'Service A');
        writeMinimalSpec(path.join(tempDir, 'b.json'), 'https://b.example.com', 'Service B');
        writeFileSync(path.join(tempDir, 'request-a.ts'), 'export async function request() { return "from-a"; }\n');
        writeFileSync(path.join(tempDir, 'request-b.ts'), 'export async function request() { return "from-b"; }\n');

        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                cache: true,
                cacheStrategy: 'reuse',
                cachePath: './.store',
                reuseMode: 'auto-group',
                request: './request-a.ts',
                items: [
                    { input: './a.json', output: './out/api-a' },
                    { input: './b.json', output: './out/api-b', request: './request-b.ts' },
                ],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.equal(result.success, true, result.error);

        const requestA = readFileSync(path.join(tempDir, 'out', 'api-a', 'core', 'request.ts'), 'utf8');
        const requestB = readFileSync(path.join(tempDir, 'out', 'api-b', 'core', 'request.ts'), 'utf8');

        // First writer shares; second keeps a full local copy with its own content
        assert.ok(isStub(requestA) || requestA.includes('from-a'));
        assert.ok(requestB.includes('from-b'), 'item B must keep its own request content');
        assert.ok(!isStub(requestB) || !requestB.includes('from-a'), 'item B must not resolve to item A request');
        if (isStub(requestA)) {
            const shared = readFileSync(path.join(tempDir, 'out', '__shared__', 'core', 'request.ts'), 'utf8');
            assert.match(shared, /from-a/);
        }
    });

    test('4.3 different OpenAPI servers keep full local OpenAPI.ts', async t => {
        const tempDir = createTempDir(t, 'shared-core-openapi-');
        const previousCwd = process.cwd();
        process.chdir(tempDir);
        t.after(() => process.chdir(previousCwd));

        writeMinimalSpec(path.join(tempDir, 'a.json'), 'https://server-a.example.com', 'Service A');
        writeMinimalSpec(path.join(tempDir, 'b.json'), 'https://server-b.example.com', 'Service B');

        const configPath = path.join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                httpClient: 'fetch',
                cache: true,
                cacheStrategy: 'reuse',
                cachePath: './.store',
                reuseMode: 'auto-group',
                items: [
                    { input: './a.json', output: './out/api-a' },
                    { input: './b.json', output: './out/api-b' },
                ],
            })
        );

        const result = await generateOpenApiClient({ openapiConfig: configPath });
        assert.equal(result.success, true, result.error);

        const openApiA = readFileSync(path.join(tempDir, 'out', 'api-a', 'core', 'OpenAPI.ts'), 'utf8');
        const openApiB = readFileSync(path.join(tempDir, 'out', 'api-b', 'core', 'OpenAPI.ts'), 'utf8');

        // First writer may share its OpenAPI; the second must keep a full local file (not A's server).
        assert.ok(!isStub(openApiB), 'OpenAPI B should be full local file on content conflict');
        assert.match(openApiB, /server-b\.example\.com/);
        if (isStub(openApiA)) {
            const shared = readFileSync(path.join(tempDir, 'out', '__shared__', 'core', 'OpenAPI.ts'), 'utf8');
            assert.match(shared, /server-a\.example\.com/);
            assert.ok(!shared.includes('server-b.example.com'));
        } else {
            assert.match(openApiA, /server-a\.example\.com/);
        }
    });
});
