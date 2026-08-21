import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import type { TStrictFlatOptions } from '../../common/TRawOptions';
import { GenerationBatchSession } from '../GenerationBatchSession';
import type { GenerationRootOptions } from '../resolveGenerationOptions';
import type { GenerationReport } from '../reuseStore/GenerationReport';
import { ReuseConflictError } from '../reuseStore/types';
import type { WriteClient } from '../WriteClient';

const generatedRoot = path.join(__dirname, '../../../test/generated');

function makeItem(overrides: Partial<TStrictFlatOptions> & { input: string; output: string; cachePath: string }): TStrictFlatOptions {
    return {
        cache: true,
        cacheStrategy: 'reuse',
        cacheDebug: true,
        useSeparatedIndexes: false,
        modelsMode: 'interfaces',
        modelsLayout: 'bundle',
        ...overrides,
    } as TStrictFlatOptions;
}

function makeWriteClient(tracker: { calls: string[] }): WriteClient {
    const logger = {
        forceInfo: () => undefined,
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined,
        shutdownLogger: () => {
            tracker.calls.push('shutdownLogger');
        },
    };
    return {
        logger,
        combineAndWrite: async () => {
            tracker.calls.push('combineAndWrite');
        },
        combineAndWrightSimple: async () => {
            tracker.calls.push('combineAndWrightSimple');
        },
        getExpectedOutputFiles: () => new Set<string>(),
        getWriteStats: () => ({ written: 0, unchanged: 0 }),
        clearLintTargets: () => {
            tracker.calls.push('clearLintTargets');
        },
        getLintTargets: () => ({ files: [] as string[], includeGlobs: [] as string[] }),
    } as unknown as WriteClient;
}

function makeTempWorkspace(prefix: string): { root: string; output: string; cachePath: string } {
    fs.mkdirSync(generatedRoot, { recursive: true });
    const root = fs.mkdtempSync(path.join(generatedRoot, prefix));
    const output = path.join(root, 'out');
    const cachePath = path.join(root, 'store');
    fs.mkdirSync(output, { recursive: true });
    fs.mkdirSync(cachePath, { recursive: true });
    return { root, output, cachePath };
}

function seedManifest(cachePath: string, params: { specItem: string; keepKey: string; orphanKey: string }): void {
    const now = new Date().toISOString();
    const artifact = (artifactKey: string, name: string) => ({
        artifactKey,
        name,
        kind: 'model' as const,
        schemaHash: 'hash',
        optionsSliceHash: 'opts',
        relativePath: `artifacts/${name}.ts`,
        contentHash: 'content',
        byteSize: 1,
        firstSeenSpec: params.specItem,
        referencedBy: [{ specItem: params.specItem, outputPath: 'out' }],
        createdAt: now,
        updatedAt: now,
    });

    fs.writeFileSync(
        path.join(cachePath, 'manifest.json'),
        JSON.stringify(
            {
                version: 2,
                generatorVersion: 'dev',
                updatedAt: now,
                artifacts: {
                    [params.keepKey]: artifact(params.keepKey, 'Keep'),
                    [params.orphanKey]: artifact(params.orphanKey, 'Orphan'),
                },
                specItems: {
                    [params.specItem]: {
                        input: `${params.specItem}.yaml`,
                        lastGeneratedAt: now,
                        artifactKeys: [params.keepKey],
                    },
                },
            },
            null,
            2
        )
    );
}

describe('@unit: GenerationBatchSession', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    test('skips combine and ESLint when all items entity-skipped', async () => {
        const ws = makeTempWorkspace('gbs-skip-');
        tmpDir = ws.root;

        const tracker = { calls: [] as string[] };
        const writeClient = makeWriteClient(tracker);
        const item = makeItem({ input: 'a.yaml', output: ws.output, cachePath: ws.cachePath });

        const session = new GenerationBatchSession({
            writeClient,
            eslintFixOptions: {},
            generateItem: async () => ({ entitySkipped: true }),
            shouldEntitySkip: async () => false,
        });

        await session.run([item], {} as GenerationRootOptions);

        assert.ok(!tracker.calls.includes('combineAndWrite'));
        assert.ok(!tracker.calls.includes('combineAndWrightSimple'));
        assert.ok(tracker.calls.includes('clearLintTargets'));
        assert.ok(tracker.calls.includes('shutdownLogger'));
    });

    test('writes final report after GC with phases when cacheDebug', async () => {
        const ws = makeTempWorkspace('gbs-phases-');
        tmpDir = ws.root;

        const tracker = { calls: [] as string[] };
        const writeClient = makeWriteClient(tracker);
        const item = makeItem({ input: 'api.yaml', output: ws.output, cachePath: ws.cachePath, cacheDebug: true });

        const session = new GenerationBatchSession({
            writeClient,
            eslintFixOptions: {},
            generateItem: async (_item, _cache, ctx) => {
                ctx.reuseStore?.getManifest();
                return { entitySkipped: true };
            },
            shouldEntitySkip: async () => false,
        });

        await session.run([item], {} as GenerationRootOptions);

        const reportPath = path.join(ws.cachePath, 'reports', 'latest.json');
        assert.ok(fs.existsSync(reportPath), 'expected generation report');
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as GenerationReport;
        assert.ok(report.phases, 'expected phases on final report');
        const phases = report.phases!;
        assert.equal(typeof phases.gcMs, 'number');
        assert.equal(typeof phases.manifestLoadMs, 'number');
        assert.equal(typeof phases.manifestSaveMs, 'number');
        assert.ok((phases.manifestLoadMs ?? -1) >= 0);
        assert.ok((phases.gcMs ?? -1) >= 0);
    });

    test('warm preAnalyze uses shouldEntitySkip and still runs generateItem', async () => {
        const ws = makeTempWorkspace('gbs-warm-');
        tmpDir = ws.root;

        const tracker = { calls: [] as string[] };
        const writeClient = makeWriteClient(tracker);
        const item = makeItem({ input: 'warm.yaml', output: ws.output, cachePath: ws.cachePath });

        let shouldSkipCalls = 0;
        let generateCalls = 0;

        const session = new GenerationBatchSession({
            writeClient,
            eslintFixOptions: {},
            generateItem: async () => {
                generateCalls += 1;
                return { entitySkipped: true };
            },
            shouldEntitySkip: async () => {
                shouldSkipCalls += 1;
                return true;
            },
        });

        await session.run([item], { preAnalyze: true } as GenerationRootOptions);

        assert.equal(shouldSkipCalls, 1);
        assert.equal(generateCalls, 1);
    });

    test('passes specAnalysisAccumulator via itemRunContext', async () => {
        const ws = makeTempWorkspace('gbs-acc-');
        tmpDir = ws.root;

        const writeClient = makeWriteClient({ calls: [] });
        const item = makeItem({
            input: 'acc.yaml',
            output: ws.output,
            cachePath: ws.cachePath,
            cache: false,
            specAnalysis: { enabled: true },
        } as Partial<TStrictFlatOptions> & { input: string; output: string; cachePath: string });

        let sawAccumulator = false;
        const session = new GenerationBatchSession({
            writeClient,
            eslintFixOptions: {},
            generateItem: async (_item, _cache, ctx) => {
                sawAccumulator = ctx.specAnalysisAccumulator !== null;
                return { entitySkipped: false };
            },
            shouldEntitySkip: async () => false,
        });

        await session.run([item], {} as GenerationRootOptions);
        assert.equal(sawAccumulator, true);
    });

    test('early conflict dump writes report before rethrow', async () => {
        const ws = makeTempWorkspace('gbs-conflict-');
        tmpDir = ws.root;

        const writeClient = makeWriteClient({ calls: [] });
        const item = makeItem({ input: 'conflict.yaml', output: ws.output, cachePath: ws.cachePath });

        const session = new GenerationBatchSession({
            writeClient,
            eslintFixOptions: {},
            generateItem: async () => {
                throw new ReuseConflictError({
                    kind: 'model',
                    name: 'User',
                    existingSpec: 'a',
                    incomingSpec: 'b',
                    existingSchemaHash: 'aaaaaaaa',
                    incomingSchemaHash: 'bbbbbbbb',
                });
            },
            shouldEntitySkip: async () => false,
        });

        await assert.rejects(() => session.run([item], {} as GenerationRootOptions), ReuseConflictError);

        const reportPath = path.join(ws.cachePath, 'reports', 'latest.json');
        assert.ok(fs.existsSync(reportPath), 'expected early conflict report');
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as GenerationReport;
        assert.equal(report.reuse.conflicts.length, 1);
        if (report.phases) {
            assert.equal(report.phases.gcMs, 0);
            assert.equal(report.phases.manifestSaveMs, 0);
        }
    });

    test('runs combine when at least one item is not entity-skipped', async () => {
        const ws = makeTempWorkspace('gbs-combine-');
        tmpDir = ws.root;

        const tracker = { calls: [] as string[] };
        const writeClient = makeWriteClient(tracker);
        const item = makeItem({ input: 'c.yaml', output: ws.output, cachePath: ws.cachePath, cache: false });

        const session = new GenerationBatchSession({
            writeClient,
            eslintFixOptions: {},
            generateItem: async () => ({ entitySkipped: false }),
            shouldEntitySkip: async () => false,
        });

        await session.run([item], {} as GenerationRootOptions);
        assert.ok(tracker.calls.includes('combineAndWrite'));
    });

    test('GC keeps referenced artifact keys accumulated from entity-skipped items', async () => {
        const ws = makeTempWorkspace('gbs-gc-');
        tmpDir = ws.root;

        const keepKey = 'keep-artifact';
        const orphanKey = 'orphan-artifact';
        const specItem = 'gc-spec';
        seedManifest(ws.cachePath, { specItem, keepKey, orphanKey });

        const writeClient = makeWriteClient({ calls: [] });
        const item = makeItem({ input: `${specItem}.yaml`, output: ws.output, cachePath: ws.cachePath });

        const session = new GenerationBatchSession({
            writeClient,
            eslintFixOptions: {},
            generateItem: async () => ({ entitySkipped: true }),
            shouldEntitySkip: async () => false,
        });

        await session.run([item], {} as GenerationRootOptions);

        const manifest = JSON.parse(fs.readFileSync(path.join(ws.cachePath, 'manifest.json'), 'utf8')) as {
            artifacts: Record<string, unknown>;
        };
        assert.ok(manifest.artifacts[keepKey], 'referenced key must survive GC');
        assert.equal(manifest.artifacts[orphanKey], undefined, 'unreferenced key must be GCd');
    });
});
