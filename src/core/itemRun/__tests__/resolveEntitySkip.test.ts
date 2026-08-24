import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../common/Consts';
import type { TStrictFlatOptions } from '../../../common/TRawOptions';
import { buildCacheKey, buildEntityFingerprint, getSpecItemName } from '../../generationCache/EntitySkip';
import { GenerationCache } from '../../generationCache/GenerationCache';
import { resolveEntitySkip } from '../resolveEntitySkip';

const generatedRoot = path.join(__dirname, '../../../../../test/generated');

function baseItem(overrides: Partial<TStrictFlatOptions> = {}): TStrictFlatOptions {
    return { ...COMMON_DEFAULT_OPTIONS_VALUES, input: 'spec.yaml', output: 'out', ...overrides } as TStrictFlatOptions;
}

describe('@unit: resolveEntitySkip', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    test('returns skipped:false when generationCache is null', async () => {
        const item = baseItem({ cache: true, cacheStrategy: 'entity' });
        const result = await resolveEntitySkip(item, '/some/input.yaml', null, null, 'spec');
        assert.deepEqual(result, { skipped: false });
    });

    test('returns skipped:false when item.cache is false', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-test-'));
        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        const item = baseItem({ cache: false, cacheStrategy: 'entity' });
        const specPath = path.join(tmpDir, 'spec.yaml');
        writeFileSync(specPath, 'openapi: 3.0.0\ninfo: {title: t, version: 1}\npaths: {}', 'utf8');
        const result = await resolveEntitySkip(item, specPath, cache, null, 'spec');
        assert.deepEqual(result, { skipped: false });
    });

    test('returns skipped:false on cache miss (no matching entry)', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-miss-'));
        const specPath = path.join(tmpDir, 'spec.yaml');
        writeFileSync(specPath, 'openapi: 3.0.0\ninfo: {title: t, version: 1}\npaths: {}', 'utf8');

        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        const item = baseItem({ input: specPath, output: path.join(tmpDir, 'out'), cache: true, cacheStrategy: 'entity' });
        const specInput = getSpecItemName(specPath);

        const result = await resolveEntitySkip(item, specPath, cache, null, specInput);
        assert.deepEqual(result, { skipped: false });
    });

    test('returns skipped:true with correct files on cache hit', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-hit-'));
        const specPath = path.join(tmpDir, 'spec.yaml');
        writeFileSync(specPath, 'openapi: 3.0.0\ninfo: {title: t, version: 1}\npaths: {}', 'utf8');
        const outputFile = path.join(tmpDir, 'out', 'index.ts');
        mkdirSync(path.dirname(outputFile), { recursive: true });
        writeFileSync(outputFile, 'export {}', 'utf8');

        const item = baseItem({ input: specPath, output: path.join(tmpDir, 'out'), cache: true, cacheStrategy: 'entity' });
        const specInput = getSpecItemName(specPath);
        const cacheKey = buildCacheKey(item, specPath);
        const fingerprint = await buildEntityFingerprint(item, specPath);

        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        cache.set({ key: cacheKey, fingerprint, files: [outputFile], updatedAt: Date.now() });

        const result = await resolveEntitySkip(item, specPath, cache, null, specInput);
        assert.ok(result.skipped);
        if (result.skipped) {
            assert.deepEqual(result.files, [outputFile]);
            assert.equal(result.input, specPath);
        }
    });

    test('cacheDebug flag is reflected in result', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-debug-'));
        const specPath = path.join(tmpDir, 'spec.yaml');
        writeFileSync(specPath, 'openapi: 3.0.0\ninfo: {title: t, version: 1}\npaths: {}', 'utf8');
        const outputFile = path.join(tmpDir, 'out', 'index.ts');
        mkdirSync(path.dirname(outputFile), { recursive: true });
        writeFileSync(outputFile, 'export {}', 'utf8');

        const item = baseItem({ input: specPath, output: path.join(tmpDir, 'out'), cache: true, cacheStrategy: 'entity', cacheDebug: true });
        const specInput = getSpecItemName(specPath);
        const cacheKey = buildCacheKey(item, specPath);
        const fingerprint = await buildEntityFingerprint(item, specPath);

        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        cache.set({ key: cacheKey, fingerprint, files: [outputFile], updatedAt: Date.now() });

        const result = await resolveEntitySkip(item, specPath, cache, null, specInput);
        assert.ok(result.skipped);
        if (result.skipped) {
            assert.equal(result.cacheDebug, true);
        }
    });
});
