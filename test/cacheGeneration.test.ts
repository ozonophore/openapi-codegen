import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { generate, HttpClient } from '../src';
import { Logger } from '../src/common/Logger';
import { installSilenceLoggers } from '../src/test/helpers/silenceLoggers';

const generatedRoot = path.join(__dirname, 'generated');
const specDir = path.join(__dirname, 'spec');

const createTempDir = (t: TestContext, prefix: string): string => {
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('@unit: generation cache', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
        restoreLoggers = undefined;
    });

    test('cache is disabled by default and no cache file is written', async t => {
        const tmpDir = createTempDir(t, 'cache-default-off-');
        const outputDir = path.join(tmpDir, 'out');
        const input = path.join(specDir, 'v3.json');
        const defaultCachePath = path.join(outputDir, '.openapi-codegen-cache.json');

        await generate({
            input,
            output: outputDir,
            httpClient: HttpClient.FETCH,
        } as any);

        const outputFiles = readdirSync(outputDir, { recursive: true, encoding: 'utf8' });
        assert.ok(outputFiles.includes('core/OpenAPI.ts'), 'Generation should produce output files');
        assert.throws(() => readFileSync(defaultCachePath, 'utf8'), 'Cache file should not be written when cache is disabled');
    });

    test('entity strategy: warm run does not rewrite unchanged files and writes cache file', async t => {
        const tmpDir = createTempDir(t, 'cache-entity-');
        const outputDir = path.join(tmpDir, 'out');
        const cachePath = path.join(tmpDir, 'custom-cache.json');
        const input = path.join(specDir, 'v3.json');

        await generate({
            input,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath,
        } as any);

        const stableFile = path.join(outputDir, 'core', 'OpenAPI.ts');
        const firstMtime = statSync(stableFile).mtimeMs;

        await sleep(1100);
        await generate({
            input,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath,
        } as any);

        const secondMtime = statSync(stableFile).mtimeMs;
        const cacheContent = readFileSync(cachePath, 'utf8');

        assert.equal(secondMtime, firstMtime, 'Warm run must not rewrite unchanged file');
        assert.ok(cacheContent.includes('"entries"'), 'Cache file should contain entries');
    });

    test('entity strategy: spec change rewrites affected files', async t => {
        const tmpDir = createTempDir(t, 'cache-entity-diff-');
        const outputDir = path.join(tmpDir, 'out');
        const cachePath = path.join(tmpDir, 'cache.json');
        const originalSpec = path.join(specDir, 'v3.json');
        const specCopy = path.join(tmpDir, 'v3-copy.json');

        const specObject = JSON.parse(readFileSync(originalSpec, 'utf8')) as Record<string, any>;
        writeFileSync(specCopy, JSON.stringify(specObject, null, 2), 'utf8');

        await generate({
            input: specCopy,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath,
        } as any);

        const openApiFile = path.join(outputDir, 'core', 'OpenAPI.ts');
        const firstMtime = statSync(openApiFile).mtimeMs;

        specObject.info.version = `${specObject.info.version}-cache-test`;
        writeFileSync(specCopy, JSON.stringify(specObject, null, 2), 'utf8');

        await sleep(1100);
        await generate({
            input: specCopy,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath,
        } as any);

        const secondMtime = statSync(openApiFile).mtimeMs;
        assert.ok(secondMtime > firstMtime, 'Changed spec must update generated output');
    });

    test('content strategy: warm run does not rewrite unchanged files', async t => {
        const tmpDir = createTempDir(t, 'cache-content-');
        const outputDir = path.join(tmpDir, 'out');
        const cachePath = path.join(tmpDir, 'cache-content.json');
        const input = path.join(specDir, 'v3.json');

        await generate({
            input,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'content',
            cachePath,
        } as any);

        const stableFile = path.join(outputDir, 'core', 'OpenAPI.ts');
        const firstMtime = statSync(stableFile).mtimeMs;

        await sleep(1100);
        await generate({
            input,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'content',
            cachePath,
        } as any);

        const secondMtime = statSync(stableFile).mtimeMs;
        assert.equal(secondMtime, firstMtime, 'write-if-changed should keep mtime for unchanged file');
    });

    test('multi-item with shared output: warm run keeps files and skips rewrites', async t => {
        const tmpDir = createTempDir(t, 'cache-multi-');
        const outputDir = path.join(tmpDir, 'out');
        const cachePath = 'cache-multi.json';
        const inputV2 = path.join(specDir, 'v2.json');
        const inputV3 = path.join(specDir, 'v3.json');

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath,
            items: [
                { input: inputV2, output: outputDir },
                { input: inputV3, output: outputDir },
            ],
        } as any);

        const stableFile = path.join(outputDir, 'core', 'OpenAPI.ts');
        const firstMtime = statSync(stableFile).mtimeMs;
        const filesBefore = readdirSync(outputDir, { recursive: true, encoding: 'utf8' });

        await sleep(1100);
        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath,
            items: [
                { input: inputV2, output: outputDir },
                { input: inputV3, output: outputDir },
            ],
        } as any);

        const secondMtime = statSync(stableFile).mtimeMs;
        const filesAfter = readdirSync(outputDir, { recursive: true, encoding: 'utf8' });
        const cacheContent = JSON.parse(readFileSync(path.join(outputDir, cachePath), 'utf8')) as { entries?: Record<string, unknown> };
        const entriesCount = Object.keys(cacheContent.entries || {}).length;

        assert.equal(secondMtime, firstMtime, 'Warm run should skip rewriting shared output files');
        assert.ok(filesAfter.length > 0, 'Output must remain non-empty after selective clean');
        assert.ok(filesBefore.includes('core/OpenAPI.ts'), 'First run must produce OpenAPI core file');
        assert.ok(filesAfter.includes('core/OpenAPI.ts'), 'Warm run must keep OpenAPI core file');
        assert.ok(entriesCount >= 2, 'Cache should store separate entries for multiple items');
    });

    test('warns once for shared output when cache is disabled', async t => {
        const tmpDir = createTempDir(t, 'cache-warning-');
        const outputDir = path.join(tmpDir, 'out');
        const inputV2 = path.join(specDir, 'v2.json');
        const inputV3 = path.join(specDir, 'v3.json');
        const warnings: string[] = [];
        const originalWarn = Logger.prototype.warn;

        Logger.prototype.warn = function patchedWarn(message: string) {
            warnings.push(message);
            return originalWarn.call(this, message);
        };
        t.after(() => {
            Logger.prototype.warn = originalWarn;
        });

        await generate({
            httpClient: HttpClient.FETCH,
            cache: false,
            items: [
                { input: inputV2, output: outputDir },
                { input: inputV3, output: outputDir },
            ],
        } as any);

        const relevantWarnings = warnings.filter(message => message.includes('Cache is disabled') && message.includes(outputDir));
        assert.equal(relevantWarnings.length, 1, 'Should emit one grouped warning for shared output without cache');
        assert.ok(relevantWarnings[0]?.includes('--cache'), 'Warning should recommend enabling cache');
    });
});
