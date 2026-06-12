import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { generate, HttpClient } from '../src';
import { ReuseStore } from '../src/core/reuseStore/ReuseStore';
import { ReuseConflictError } from '../src/core/reuseStore/types';
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

describe('@unit: reuse store integration', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
        restoreLoggers = undefined;
    });

    test('shares one store artifact and copies full content to two outputs', async t => {
        const tmpDir = createTempDir(t, 'reuse-store-shared-');
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
            items: [
                { input: specA, output: outputA },
                { input: specB, output: outputB },
            ],
        } as any);

        const manifest = JSON.parse(readFileSync(path.join(storePath, 'manifest.json'), 'utf8')) as {
            artifacts: Record<string, { name: string; relativePath: string; referencedBy: Array<{ specItem: string; kind: string }> }>;
        };
        const artifactEntries = Object.values(manifest.artifacts);
        const userArtifacts = artifactEntries.filter(entry => entry.relativePath.includes('models/User'));

        assert.equal(userArtifacts.length, 1, 'Identical User schema should produce one store artifact');
        const contentA = readFileSync(path.join(outputA, 'models', 'User.ts'), 'utf8');
        const contentB = readFileSync(path.join(outputB, 'models', 'User.ts'), 'utf8');
        const storeContent = readFileSync(path.join(storePath, userArtifacts[0]!.relativePath), 'utf8');

        assert.ok(contentA.includes('export interface IUser') || contentA.includes('export type IUser'), 'Output should contain full model definition');
        assert.ok(!contentA.includes("from '.openapi-codegen-store"), 'Output should not re-export from store');
        assert.ok(!contentB.includes("from '.openapi-codegen-store"), 'Output should not re-export from store');
        assert.equal(contentA, contentB, 'Both outputs should have identical content');
        assert.equal(contentA, storeContent, 'Output should match store artifact byte-for-byte');

        const referencedSpecItems = new Set(userArtifacts[0]!.referencedBy.map(ref => ref.specItem));
        assert.ok(referencedSpecItems.has('api-a'));
        assert.ok(referencedSpecItems.has('api-b'));
        assert.ok(userArtifacts[0]!.referencedBy.every(ref => ref.kind === 'artifact'), 'All manifest references should use kind artifact');
    });

    test('second spec hits existing store artifact without creating a duplicate', async t => {
        const tmpDir = createTempDir(t, 'reuse-store-hit-');
        const storePath = path.join(tmpDir, '.openapi-codegen-store');
        const outputA = path.join(tmpDir, 'out-a');
        const outputB = path.join(tmpDir, 'out-b');
        const specA = path.join(tmpDir, 'api-a.json');
        const specB = path.join(tmpDir, 'api-b.json');

        writeReuseSpec(specA, 'API A', '/users-a', 'getUsersA', sharedUserSchema);
        writeReuseSpec(specB, 'API B', '/users-b', 'getUsersB', sharedUserSchema);

        const generateOptions = {
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'reuse',
            cachePath: storePath,
        } as const;

        await generate({ ...generateOptions, items: [{ input: specA, output: outputA }] } as any);

        const manifestAfterFirst = JSON.parse(readFileSync(path.join(storePath, 'manifest.json'), 'utf8')) as {
            artifacts: Record<string, { name: string; relativePath: string; referencedBy: Array<{ specItem: string; kind: string }> }>;
        };
        const artifactCountAfterFirst = Object.keys(manifestAfterFirst.artifacts).length;
        const userArtifactAfterFirst = Object.values(manifestAfterFirst.artifacts).find(entry => entry.relativePath.includes('models/User'));
        assert.ok(userArtifactAfterFirst);
        assert.equal(userArtifactAfterFirst!.referencedBy.length, 1);
        assert.equal(userArtifactAfterFirst!.referencedBy[0]!.kind, 'artifact');

        await generate({ ...generateOptions, items: [{ input: specB, output: outputB }] } as any);

        const manifestAfterSecond = JSON.parse(readFileSync(path.join(storePath, 'manifest.json'), 'utf8')) as {
            artifacts: Record<string, { name: string; relativePath: string; referencedBy: Array<{ specItem: string; kind: string }> }>;
        };
        const userArtifacts = Object.values(manifestAfterSecond.artifacts).filter(entry => entry.relativePath.includes('models/User'));

        assert.equal(Object.keys(manifestAfterSecond.artifacts).length, artifactCountAfterFirst, 'Hit should not create duplicate store artifacts');
        assert.equal(userArtifacts.length, 1);
        assert.ok(userArtifacts[0]!.referencedBy.some(ref => ref.specItem === 'api-b' && ref.kind === 'artifact'));
    });

    test('re-renders artifact when store integrity check fails', async t => {
        const tmpDir = createTempDir(t, 'reuse-store-integrity-');
        const storePath = path.join(tmpDir, '.openapi-codegen-store');
        const outputA = path.join(tmpDir, 'out-a');
        const specA = path.join(tmpDir, 'api-a.json');

        writeReuseSpec(specA, 'API A', '/users-a', 'getUsersA', sharedUserSchema);

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'reuse',
            cachePath: storePath,
            items: [{ input: specA, output: outputA }],
        } as any);

        const manifestBefore = JSON.parse(readFileSync(path.join(storePath, 'manifest.json'), 'utf8')) as {
            artifacts: Record<string, { relativePath: string; contentHash: string }>;
        };
        const userArtifact = Object.values(manifestBefore.artifacts).find(entry => entry.relativePath.includes('models/User'));
        assert.ok(userArtifact);

        const storeArtifactPath = path.join(storePath, userArtifact!.relativePath);
        writeFileSync(storeArtifactPath, '/* corrupted artifact */', 'utf8');

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'reuse',
            cachePath: storePath,
            items: [{ input: specA, output: outputA }],
        } as any);

        const manifestAfter = JSON.parse(readFileSync(path.join(storePath, 'manifest.json'), 'utf8')) as {
            artifacts: Record<string, { relativePath: string; contentHash: string }>;
        };
        const userArtifactAfter = Object.values(manifestAfter.artifacts).find(entry => entry.relativePath.includes('models/User'));
        assert.ok(userArtifactAfter);

        const outputContent = readFileSync(path.join(outputA, 'models', 'User.ts'), 'utf8');
        const restoredStoreContent = readFileSync(storeArtifactPath, 'utf8');

        assert.ok(outputContent.includes('export interface IUser') || outputContent.includes('export type IUser'));
        assert.ok(!outputContent.includes('corrupted artifact'));
        assert.equal(outputContent, restoredStoreContent, 'Output and store artifact should match after re-render');
        assert.equal(userArtifactAfter.contentHash, ReuseStore.hashContent(restoredStoreContent), 'Store hash should match restored artifact content');
    });

    test('namespaces conflicting schemas when reuseOnConflict is namespace', async t => {
        const tmpDir = createTempDir(t, 'reuse-store-namespace-');
        const storePath = path.join(tmpDir, '.openapi-codegen-store');
        const outputA = path.join(tmpDir, 'out-a');
        const outputB = path.join(tmpDir, 'out-b');
        const specA = path.join(tmpDir, 'api-a.json');
        const specB = path.join(tmpDir, 'api-b.json');

        writeReuseSpec(specA, 'API A', '/users-a', 'getUsersA', sharedUserSchema);
        writeReuseSpec(specB, 'API B', '/users-b', 'getUsersB', {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
            },
            required: ['id', 'name'],
        });

        await generate({
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'reuse',
            cachePath: storePath,
            reuseOnConflict: 'namespace',
            items: [
                { input: specA, output: outputA },
                { input: specB, output: outputB },
            ],
        } as any);

        const manifest = JSON.parse(readFileSync(path.join(storePath, 'manifest.json'), 'utf8')) as {
            artifacts: Record<string, { name: string; relativePath: string; referencedBy: Array<{ specItem: string; kind: string }> }>;
        };
        const userArtifacts = Object.values(manifest.artifacts).filter(entry => entry.relativePath.includes('models/User'));

        assert.equal(userArtifacts.length, 2, 'Conflicting User schemas should produce separate namespaced store artifacts');
        assert.ok(userArtifacts.every(entry => entry.referencedBy.every(ref => ref.kind === 'artifact')));
        assert.ok(readFileSync(path.join(outputA, 'models', 'User.ts'), 'utf8').includes('id: string'));
        assert.ok(readFileSync(path.join(outputB, 'models', 'User.ts'), 'utf8').includes('id: number'));
    });

    test('throws ReuseConflictError when same model name has different schemas', async t => {
        const tmpDir = createTempDir(t, 'reuse-store-conflict-');
        const storePath = path.join(tmpDir, '.openapi-codegen-store');
        const outputA = path.join(tmpDir, 'out-a');
        const outputB = path.join(tmpDir, 'out-b');
        const specA = path.join(tmpDir, 'api-a.json');
        const specB = path.join(tmpDir, 'api-b.json');

        writeReuseSpec(specA, 'API A', '/users-a', 'getUsersA', sharedUserSchema);
        writeReuseSpec(specB, 'API B', '/users-b', 'getUsersB', {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
            },
            required: ['id', 'name'],
        });

        await assert.rejects(
            () =>
                generate({
                    httpClient: HttpClient.FETCH,
                    cache: true,
                    cacheStrategy: 'reuse',
                    cachePath: storePath,
                    items: [
                        { input: specA, output: outputA },
                        { input: specB, output: outputB },
                    ],
                } as any),
            ReuseConflictError
        );
    });
});
