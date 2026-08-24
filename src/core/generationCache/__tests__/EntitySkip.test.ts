import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../common/Consts';
import type { TStrictFlatOptions } from '../../../common/TRawOptions';
import { resolveHelper } from '../../../common/utils/pathHelpers';
import { buildGenerationAffectingHash, GENERATION_AFFECTING_KEYS, REUSE_OPTIONS_SLICE_KEYS } from '../../generationAffectingOptions';
import { GenerationCache } from '../../generationCache/GenerationCache';
import { buildOptionsSlice, buildOptionsSliceHash } from '../../reuseStore/ArtifactFingerprinter';
import type { ReuseStore } from '../../reuseStore/ReuseStore';
import { ModelsLayout } from '../../types/enums/ModelsLayout.enum';
import { ModelsMode } from '../../types/enums/ModelsMode.enum';
import {
    buildCacheKey,
    buildEntityFingerprint,
    ENTITY_CACHE_FINGERPRINT_VERSION,
    getSpecItemName,
    resolveEntitySkipCandidate,
    shouldEntitySkip,
    usesEntityCache,
    usesReuseStoreForItem,
} from '../EntitySkip';

const generatedRoot = path.join(__dirname, '../../../../test/generated');

function baseItem(overrides: Partial<TStrictFlatOptions> = {}): TStrictFlatOptions {
    return { ...COMMON_DEFAULT_OPTIONS_VALUES, input: 'spec.yaml', output: 'out', ...overrides } as TStrictFlatOptions;
}

function fakeReuseStore(specItems: Record<string, { input: string; lastGeneratedAt: string; artifactKeys: string[] }>, specItemIntegrity = true): ReuseStore {
    return {
        getManifest: () => ({ specItems }),
        verifySpecItemIntegrity: async () => specItemIntegrity,
    } as unknown as ReuseStore;
}

describe('@unit: EntitySkip', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    test('ENTITY_CACHE_FINGERPRINT_VERSION is 4', () => {
        assert.equal(ENTITY_CACHE_FINGERPRINT_VERSION, 4);
    });

    test('reuse OptionsSlice keys are a subset of generation-affecting keys', () => {
        const affecting = new Set<string>(GENERATION_AFFECTING_KEYS);
        for (const key of REUSE_OPTIONS_SLICE_KEYS) {
            assert.equal(affecting.has(key), true, `"${key}" must be in GENERATION_AFFECTING_KEYS`);
        }
        assert.equal(affecting.has('plugins'), true);
    });

    test('former residual-only keys remain in affecting allowlist', () => {
        const affecting = new Set<string>(GENERATION_AFFECTING_KEYS);
        for (const key of [
            'request',
            'useOptions',
            'includeSchemasFiles',
            'excludeCoreServiceFiles',
            'strictPluginMode',
            'customExecutorPath',
            'useCancelableRequest',
            'useHistory',
            'diffReport',
            'strictOpenapi',
            'failOnGovernanceErrors',
        ]) {
            assert.equal(affecting.has(key), true, `"${key}" must remain affecting`);
        }
    });

    test('fingerprint changes with OptionsSlice field via affecting hash', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-fp-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(specPath, 'openapi: 3.0.0\ninfo: { title: t, version: 1 }\npaths: {}', 'utf8');

        const a = baseItem({ prettierConfigPath: '.prettierrc' });
        const b = baseItem({ prettierConfigPath: 'other.prettierrc' });
        const fpA = await buildEntityFingerprint(a, specPath);
        const fpB = await buildEntityFingerprint(b, specPath);
        assert.notEqual(fpA, fpB);
        assert.notEqual(buildGenerationAffectingHash(a), buildGenerationAffectingHash(b));
    });

    test('fingerprint changes with plugin config via affecting hash', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-plugin-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(specPath, 'openapi: 3.0.0\ninfo: { title: t, version: 1 }\npaths: {}', 'utf8');

        const a = baseItem({ plugins: [{ path: './p.cjs', name: 'p', config: { mode: 'a' } }] });
        const b = baseItem({ plugins: [{ path: './p.cjs', name: 'p', config: { mode: 'b' } }] });
        assert.notEqual(await buildEntityFingerprint(a, specPath), await buildEntityFingerprint(b, specPath));
    });

    test('fingerprint changes with former residual-only field while reuse slice hash stays equal', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-res-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(specPath, 'openapi: 3.0.0\ninfo: { title: t, version: 1 }\npaths: {}', 'utf8');

        const a = baseItem({ request: undefined });
        const b = baseItem({ request: './custom-request.ts' });
        assert.notEqual(await buildEntityFingerprint(a, specPath), await buildEntityFingerprint(b, specPath));
        assert.notEqual(buildGenerationAffectingHash(a), buildGenerationAffectingHash(b));
        assert.equal(buildOptionsSliceHash(buildOptionsSlice(a)), buildOptionsSliceHash(buildOptionsSlice(b)));
    });

    test('usesEntityCache is true for plain reuse, false for content', () => {
        const cache = new GenerationCache(path.join(generatedRoot, 'x.json'));
        assert.equal(usesEntityCache(baseItem({ cache: true, cacheStrategy: 'reuse', modelsMode: ModelsMode.INTERFACES }), cache), true);
        assert.equal(usesEntityCache(baseItem({ cache: true, cacheStrategy: 'entity' }), cache), true);
        assert.equal(usesEntityCache(baseItem({ cache: true, cacheStrategy: 'content' }), cache), false);
        assert.equal(usesEntityCache(baseItem({ cache: true, cacheStrategy: 'reuse' }), null), false);
    });

    test('resolveEntitySkipCandidate returns false without entity cache', async () => {
        assert.equal(
            await resolveEntitySkipCandidate({
                useEntityCache: false,
                generationCache: null,
                cacheKey: 'k',
                cacheFingerprint: 'fp',
                useReuseStore: false,
                reuseStore: null,
                specInput: 'api-a',
                filesExist: async () => true,
            }),
            false
        );
    });

    test('resolveEntitySkipCandidate returns true on fingerprint and files match', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-hit-'));
        const outputFile = path.join(tmpDir, 'core', 'OpenAPI.ts');
        mkdirSync(path.dirname(outputFile), { recursive: true });
        writeFileSync(outputFile, 'export {}', 'utf8');

        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        const cacheKey = 'item-key';
        const fingerprint = 'fp-match';
        cache.set({ key: cacheKey, fingerprint, files: [outputFile], updatedAt: Date.now() });

        assert.equal(
            await resolveEntitySkipCandidate({
                useEntityCache: true,
                generationCache: cache,
                cacheKey,
                cacheFingerprint: fingerprint,
                useReuseStore: false,
                reuseStore: null,
                specInput: 'api-a',
                filesExist: async paths => paths.every(p => p === outputFile),
            }),
            true
        );
    });

    test('resolveEntitySkipCandidate returns false when cached file missing', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-miss-'));
        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        const cacheKey = 'item-key';
        const fingerprint = 'fp-match';
        cache.set({ key: cacheKey, fingerprint, files: [path.join(tmpDir, 'missing.ts')], updatedAt: Date.now() });

        assert.equal(
            await resolveEntitySkipCandidate({
                useEntityCache: true,
                generationCache: cache,
                cacheKey,
                cacheFingerprint: fingerprint,
                useReuseStore: false,
                reuseStore: null,
                specInput: 'api-a',
                filesExist: async () => false,
            }),
            false
        );
    });

    test('resolveEntitySkipCandidate denies skip when reuse manifest entry is missing', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-manifest-deny-'));
        const outputFile = path.join(tmpDir, 'out.ts');
        writeFileSync(outputFile, 'export {}', 'utf8');

        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        const cacheKey = 'item-key';
        const fingerprint = 'fp-match';
        cache.set({ key: cacheKey, fingerprint, files: [outputFile], updatedAt: Date.now() });

        assert.equal(
            await resolveEntitySkipCandidate({
                useEntityCache: true,
                generationCache: cache,
                cacheKey,
                cacheFingerprint: fingerprint,
                useReuseStore: true,
                reuseStore: fakeReuseStore({}),
                specInput: 'api-a',
                filesExist: async () => true,
            }),
            false
        );
    });

    test('resolveEntitySkipCandidate denies skip when reuse store artifact integrity fails', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-integrity-deny-'));
        const outputFile = path.join(tmpDir, 'out.ts');
        writeFileSync(outputFile, 'export {}', 'utf8');

        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        const cacheKey = 'item-key';
        const fingerprint = 'fp-match';
        cache.set({ key: cacheKey, fingerprint, files: [outputFile], updatedAt: Date.now() });

        assert.equal(
            await resolveEntitySkipCandidate({
                useEntityCache: true,
                generationCache: cache,
                cacheKey,
                cacheFingerprint: fingerprint,
                useReuseStore: true,
                reuseStore: fakeReuseStore(
                    {
                        'api-a': { input: 'api-a.yaml', lastGeneratedAt: new Date().toISOString(), artifactKeys: ['k'] },
                    },
                    false
                ),
                specInput: 'api-a',
                filesExist: async () => true,
            }),
            false
        );
    });

    test('resolveEntitySkipCandidate allows skip when reuse manifest entry is present', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-manifest-allow-'));
        const outputFile = path.join(tmpDir, 'out.ts');
        writeFileSync(outputFile, 'export {}', 'utf8');

        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        const cacheKey = 'item-key';
        const fingerprint = 'fp-match';
        cache.set({ key: cacheKey, fingerprint, files: [outputFile], updatedAt: Date.now() });

        assert.equal(
            await resolveEntitySkipCandidate({
                useEntityCache: true,
                generationCache: cache,
                cacheKey,
                cacheFingerprint: fingerprint,
                useReuseStore: true,
                reuseStore: fakeReuseStore({
                    'api-a': { input: 'api-a.yaml', lastGeneratedAt: new Date().toISOString(), artifactKeys: ['k'] },
                }),
                specInput: 'api-a',
                filesExist: async () => true,
            }),
            true
        );
    });

    test('buildCacheKey is stable for native join vs resolveHelper input', () => {
        const specPath = path.join('/tmp', 'entity-skip-key', 'api.yaml');
        const item = baseItem({ input: specPath, output: path.join('/tmp', 'entity-skip-key', 'out') });
        assert.equal(buildCacheKey(item, specPath), buildCacheKey(item, resolveHelper(specPath)));
    });

    test('shouldEntitySkip uses injectable filesExist', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'entity-skip-should-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(specPath, 'openapi: 3.0.0\ninfo: { title: t, version: 1 }\npaths: {}', 'utf8');
        const item = baseItem({
            cache: true,
            cacheStrategy: 'entity',
            input: specPath,
            output: path.join('test', 'generated', path.basename(tmpDir), 'out'),
        });

        const cache = new GenerationCache(path.join(tmpDir, 'cache.json'));
        const absoluteInput = resolveHelper(specPath);
        const cacheKey = buildCacheKey(item, absoluteInput);
        const fingerprint = await buildEntityFingerprint(item, absoluteInput);
        cache.set({ key: cacheKey, fingerprint, files: [path.join(tmpDir, 'x.ts')], updatedAt: Date.now() });

        assert.equal(await shouldEntitySkip({ item, generationCache: cache, reuseStore: null, filesExist: async () => true }), true);
        assert.equal(await shouldEntitySkip({ item, generationCache: cache, reuseStore: null, filesExist: async () => false }), false);
    });

    test('usesReuseStoreForItem is false for classes bundle layout', () => {
        const item = baseItem({
            cache: true,
            cacheStrategy: 'reuse',
            modelsMode: ModelsMode.CLASSES,
            modelsLayout: ModelsLayout.BUNDLE,
        });
        assert.equal(usesReuseStoreForItem(item, {} as ReuseStore), false);
        assert.equal(usesEntityCache(item, new GenerationCache(path.join(generatedRoot, 'x.json'))), true);
    });

    test('getSpecItemName strips directory and extension', () => {
        assert.equal(getSpecItemName('/tmp/api-a.json'), 'api-a');
    });
});
