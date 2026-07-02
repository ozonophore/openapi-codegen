import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { generate, HttpClient } from '../src';
import type { GenerationReport } from '../src/core/reuseStore/GenerationReport';
import { installSilenceLoggers } from '../src/test/helpers/silenceLoggers';

const generatedRoot = path.join(__dirname, 'generated');

const createTempDir = (t: TestContext, prefix: string): string => {
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

const sharedUserSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
    },
    required: ['id', 'name'],
};

function writeReuseSpec(filePath: string, title: string, pathKey: string, operationId: string, userSchema: Record<string, unknown>): void {
    writeFileSync(
        filePath,
        JSON.stringify(
            {
                openapi: '3.0.0',
                info: { title, version: '1.0.0' },
                paths: {
                    [pathKey]: {
                        get: {
                            operationId,
                            responses: {
                                '200': {
                                    description: 'OK',
                                    content: {
                                        'application/json': {
                                            schema: { $ref: '#/components/schemas/User' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                components: {
                    schemas: {
                        User: userSchema,
                    },
                },
            },
            null,
            2
        ),
        'utf8'
    );
}

async function medianDuration(run: () => Promise<void>, iterations = 3): Promise<number> {
    const durations: number[] = [];
    for (let i = 0; i < iterations; i += 1) {
        const start = process.hrtime.bigint();
        await run();
        durations.push(Number(process.hrtime.bigint() - start) / 1e6);
    }
    durations.sort((a, b) => a - b);
    return durations[Math.floor(durations.length / 2)]!;
}

function buildBenchOptions(tmpDir: string, storePath: string, specA: string, specB: string, outputA: string, outputB: string) {
    return {
        httpClient: HttpClient.FETCH,
        items: [
            { input: specA, output: outputA },
            { input: specB, output: outputB },
        ],
        cachePath: storePath,
        cache: true,
        cacheStrategy: 'reuse' as const,
        tmpDir,
    };
}

describe('@unit: reuse performance', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
        restoreLoggers = undefined;
    });

    test('warm reuse is faster than cold reuse on second run', async t => {
        const tmpDir = createTempDir(t, 'reuse-perf-cold-warm-');
        const storePath = path.join(tmpDir, '.openapi-codegen-store');
        const outputA = path.join(tmpDir, 'out-a');
        const outputB = path.join(tmpDir, 'out-b');
        const specA = path.join(tmpDir, 'api-a.json');
        const specB = path.join(tmpDir, 'api-b.json');

        writeReuseSpec(specA, 'API A', '/users-a', 'getUsersA', sharedUserSchema);
        writeReuseSpec(specB, 'API B', '/users-b', 'getUsersB', sharedUserSchema);

        const options = buildBenchOptions(tmpDir, storePath, specA, specB, outputA, outputB);

        const coldStart = process.hrtime.bigint();
        await generate(options as any);
        const coldReuse = Number(process.hrtime.bigint() - coldStart) / 1e6;

        const warmReuse = await medianDuration(() => generate(options as any));

        assert.ok(warmReuse < coldReuse, `Warm reuse (${warmReuse.toFixed(1)}ms) should be faster than cold (${coldReuse.toFixed(1)}ms)`);
        assert.ok(warmReuse <= coldReuse * 0.95, `Warm reuse should be at least 5% faster than cold (${warmReuse.toFixed(1)}ms vs ${coldReuse.toFixed(1)}ms)`);
    });

    test('warm reuse is not slower than no-cache baseline', async t => {
        const tmpDir = createTempDir(t, 'reuse-perf-vs-nocache-');
        const storePath = path.join(tmpDir, '.openapi-codegen-store');
        const outputA = path.join(tmpDir, 'out-a');
        const outputB = path.join(tmpDir, 'out-b');
        const specA = path.join(tmpDir, 'api-a.json');
        const specB = path.join(tmpDir, 'api-b.json');

        writeReuseSpec(specA, 'API A', '/users-a', 'getUsersA', sharedUserSchema);
        writeReuseSpec(specB, 'API B', '/users-b', 'getUsersB', sharedUserSchema);

        const baseItems = [
            { input: specA, output: outputA },
            { input: specB, output: outputB },
        ];

        const coldNoCache = await medianDuration(() =>
            generate({
                httpClient: HttpClient.FETCH,
                cache: false,
                items: baseItems,
            } as any)
        );

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'reuse',
            cachePath: storePath,
            items: baseItems,
        } as any);

        const warmReuse = await medianDuration(() =>
            generate({
                httpClient: HttpClient.FETCH,
                cache: true,
                cacheStrategy: 'reuse',
                cachePath: storePath,
                items: baseItems,
            } as any)
        );

        assert.ok(warmReuse <= coldNoCache * 1.05, `Warm reuse (${warmReuse.toFixed(1)}ms) should not regress vs no-cache (${coldNoCache.toFixed(1)}ms)`);
    });

    test('second spec records reuse hits for shared schemas', async t => {
        const tmpDir = createTempDir(t, 'reuse-perf-hits-');
        const storePath = path.join(tmpDir, '.openapi-codegen-store');
        const outputA = path.join(tmpDir, 'out-a');
        const outputB = path.join(tmpDir, 'out-b');
        const specA = path.join(tmpDir, 'api-a.json');
        const specB = path.join(tmpDir, 'api-b.json');

        writeReuseSpec(specA, 'API A', '/users-a', 'getUsersA', sharedUserSchema);
        writeReuseSpec(specB, 'API B', '/users-b', 'getUsersB', sharedUserSchema);

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'reuse',
            cachePath: storePath,
            items: [{ input: specA, output: outputA }],
        } as any);

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'reuse',
            cachePath: storePath,
            items: [
                { input: specA, output: outputA },
                { input: specB, output: outputB },
            ],
        } as any);

        const report = JSON.parse(readFileSync(path.join(storePath, 'reports', 'latest.json'), 'utf8')) as GenerationReport;
        const specBStats = report.specs.find(entry => entry.specItem === 'api-b');

        assert.ok(specBStats);
        assert.ok((specBStats?.reuseHits ?? 0) > 0, 'Second spec should reuse shared User model');
        assert.ok(report.reuse.totalHits > 0);
    });

    test('entity cache is faster than reuse for unchanged single spec', async t => {
        const tmpDir = createTempDir(t, 'reuse-perf-entity-tradeoff-');
        const storePath = path.join(tmpDir, '.openapi-codegen-store');
        const entityCachePath = path.join(tmpDir, 'entity-cache.json');
        const outputDir = path.join(tmpDir, 'out');
        const spec = path.join(tmpDir, 'api-a.json');

        writeReuseSpec(spec, 'API A', '/users-a', 'getUsersA', sharedUserSchema);

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'reuse',
            cachePath: storePath,
            items: [{ input: spec, output: outputDir }],
        } as any);

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath: entityCachePath,
            items: [{ input: spec, output: outputDir }],
        } as any);

        const warmReuse = await medianDuration(() =>
            generate({
                httpClient: HttpClient.FETCH,
                cache: true,
                cacheStrategy: 'reuse',
                cachePath: storePath,
                items: [{ input: spec, output: outputDir }],
            } as any)
        );

        const warmEntity = await medianDuration(() =>
            generate({
                httpClient: HttpClient.FETCH,
                cache: true,
                cacheStrategy: 'entity',
                cachePath: entityCachePath,
                items: [{ input: spec, output: outputDir }],
            } as any)
        );

        assert.ok(warmEntity <= warmReuse * 1.05, `Entity cache (${warmEntity.toFixed(1)}ms) should be at least as fast as reuse (${warmReuse.toFixed(1)}ms) for single unchanged spec`);
    });
});
