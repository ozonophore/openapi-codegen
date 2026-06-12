import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../common/Consts';
import { ValidationLibrary } from '../../../core/types/enums/ValidationLibrary.enum';
import { buildOptionsSlice, buildOptionsSliceHash } from '../ArtifactFingerprinter';
import { buildModelArtifactRelativePath } from '../reuseHelpers';
import { ReuseStore } from '../ReuseStore';
import { ReuseConflictError } from '../types';

describe('@unit: ReuseStore', () => {
    test('manifest round-trip persists artifacts', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-reuse-store-'));
        try {
            const storeA = new ReuseStore(tmpDir);
            await storeA.load();

            const optionsSlice = buildOptionsSlice(COMMON_DEFAULT_OPTIONS_VALUES);
            const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
            const schema = { type: 'object', properties: { id: { type: 'string' } } };
            const relativeArtifactPath = buildModelArtifactRelativePath({ name: 'User', path: 'User', export: 'interface', alias: 'User', properties: [], enum: [] } as never, optionsSliceHash);
            storeA.register({
                name: 'User',
                kind: 'model',
                schema,
                optionsSlice,
                relativeArtifactPath,
                contentHash: ReuseStore.hashContent('export interface IUser {}'),
                specItem: 'spec_a',
                inputPath: './specs/spec_a.yaml',
                outputPath: 'src/api/spec_a/models/User.ts',
            });
            await storeA.save();

            const storeB = new ReuseStore(tmpDir);
            await storeB.load();
            const lookup = storeB.lookup('User', 'model', schema, optionsSlice);

            assert.equal(lookup.status, 'hit');
            if (lookup.status === 'hit') {
                assert.equal(lookup.entry.name, 'User');
                assert.equal(lookup.entry.relativePath, relativeArtifactPath);
            }
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test('uses distinct artifact paths for same model with different validationLibrary', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-reuse-store-'));
        try {
            const store = new ReuseStore(tmpDir);
            await store.load();
            const schema = { type: 'object', properties: { id: { type: 'string' } } };
            const model = { name: 'User', path: 'User', export: 'interface', alias: 'User', properties: [], enum: [] } as never;

            const zodSlice = buildOptionsSlice({ ...COMMON_DEFAULT_OPTIONS_VALUES, validationLibrary: ValidationLibrary.ZOD });
            const noneSlice = buildOptionsSlice({ ...COMMON_DEFAULT_OPTIONS_VALUES, validationLibrary: ValidationLibrary.NONE });
            const zodPath = buildModelArtifactRelativePath(model, buildOptionsSliceHash(zodSlice));
            const nonePath = buildModelArtifactRelativePath(model, buildOptionsSliceHash(noneSlice));

            assert.notEqual(zodPath, nonePath);

            store.register({
                name: 'User',
                kind: 'model',
                schema,
                optionsSlice: zodSlice,
                relativeArtifactPath: zodPath,
                contentHash: 'hash-zod',
                specItem: 'spec_a',
                inputPath: './specs/spec_a.yaml',
                outputPath: 'src/api/spec_a/models/User.ts',
            });
            store.register({
                name: 'User',
                kind: 'model',
                schema,
                optionsSlice: noneSlice,
                relativeArtifactPath: nonePath,
                contentHash: 'hash-none',
                specItem: 'spec_b',
                inputPath: './specs/spec_b.yaml',
                outputPath: 'src/api/spec_b/models/User.ts',
            });

            assert.equal(Object.keys(store.getManifest().artifacts).length, 2);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test('detects schema conflict for same name and kind', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-reuse-store-'));
        try {
            const store = new ReuseStore(tmpDir);
            await store.load();
            const optionsSlice = buildOptionsSlice(COMMON_DEFAULT_OPTIONS_VALUES);
            const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
            const relativeArtifactPath = buildModelArtifactRelativePath({ name: 'User', path: 'User', export: 'interface', alias: 'User', properties: [], enum: [] } as never, optionsSliceHash);

            const schemaA = { type: 'object', properties: { id: { type: 'string' } } };
            store.register({
                name: 'User',
                kind: 'model',
                schema: schemaA,
                optionsSlice,
                relativeArtifactPath,
                contentHash: 'hash-a',
                specItem: 'spec_a',
                inputPath: './specs/spec_a.yaml',
                outputPath: 'src/api/spec_a/models/User.ts',
            });

            const schemaB = { type: 'object', properties: { id: { type: 'number' } } };
            assert.throws(
                () =>
                    store.register({
                        name: 'User',
                        kind: 'model',
                        schema: schemaB,
                        optionsSlice,
                        relativeArtifactPath,
                        contentHash: 'hash-b',
                        specItem: 'spec_b',
                        inputPath: './specs/spec_b.yaml',
                        outputPath: 'src/api/spec_b/models/User.ts',
                    }),
                ReuseConflictError
            );
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test('treats missing store file as miss after integrity check', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-reuse-store-'));
        try {
            const store = new ReuseStore(tmpDir);
            await store.load();
            const optionsSlice = buildOptionsSlice(COMMON_DEFAULT_OPTIONS_VALUES);
            const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
            const schema = { type: 'object', properties: { id: { type: 'string' } } };
            const relativeArtifactPath = buildModelArtifactRelativePath({ name: 'User', path: 'User', export: 'interface', alias: 'User', properties: [], enum: [] } as never, optionsSliceHash);

            store.register({
                name: 'User',
                kind: 'model',
                schema,
                optionsSlice,
                relativeArtifactPath,
                contentHash: ReuseStore.hashContent('export interface IUser {}'),
                specItem: 'spec_a',
                inputPath: './specs/spec_a.yaml',
                outputPath: 'src/api/spec_a/models/User.ts',
            });
            await store.writeArtifact(relativeArtifactPath, 'export interface IUser {}');
            await store.save();

            const storeB = new ReuseStore(tmpDir);
            await storeB.load();
            const lookup = storeB.lookup('User', 'model', schema, optionsSlice);
            assert.equal(lookup.status, 'hit');
            if (lookup.status !== 'hit') {
                return;
            }

            fs.rmSync(storeB.resolveArtifactPath(relativeArtifactPath));
            const integrityOk = await storeB.verifyArtifactIntegrity(lookup.entry);
            assert.equal(integrityOk, false);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test('skips manifest save when nothing changed on warm lookup', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-reuse-store-'));
        try {
            const store = new ReuseStore(tmpDir);
            await store.load();
            const optionsSlice = buildOptionsSlice(COMMON_DEFAULT_OPTIONS_VALUES);
            const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
            const schema = { type: 'object', properties: { id: { type: 'string' } } };
            const relativeArtifactPath = buildModelArtifactRelativePath({ name: 'User', path: 'User', export: 'interface', alias: 'User', properties: [], enum: [] } as never, optionsSliceHash);

            store.register({
                name: 'User',
                kind: 'model',
                schema,
                optionsSlice,
                relativeArtifactPath,
                contentHash: ReuseStore.hashContent('export interface IUser {}'),
                specItem: 'spec_a',
                inputPath: './specs/spec_a.yaml',
                outputPath: 'src/api/spec_a/models/User.ts',
            });
            await store.save();
            assert.equal(store.isDirty(), false);

            const storeB = new ReuseStore(tmpDir);
            await storeB.load();
            const lookup = storeB.lookup('User', 'model', schema, optionsSlice);
            assert.equal(lookup.status, 'hit');
            if (lookup.status === 'hit') {
                storeB.markReferenced(lookup.entry.artifactKey, {
                    specItem: 'spec_a',
                    outputPath: 'src/api/spec_a/models/User.ts',
                    kind: 'artifact',
                });
            }
            assert.equal(storeB.isDirty(), false);
            await storeB.save();
            assert.equal(storeB.isDirty(), false);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test('gc removes stale artifacts not referenced in current run', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-reuse-store-'));
        try {
            const store = new ReuseStore(tmpDir);
            await store.load();
            const optionsSlice = buildOptionsSlice(COMMON_DEFAULT_OPTIONS_VALUES);
            const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
            const schema = { type: 'object', properties: { id: { type: 'string' } } };
            const relativeArtifactPath = buildModelArtifactRelativePath({ name: 'User', path: 'User', export: 'interface', alias: 'User', properties: [], enum: [] } as never, optionsSliceHash);

            const entry = store.register({
                name: 'User',
                kind: 'model',
                schema,
                optionsSlice,
                relativeArtifactPath,
                contentHash: 'hash-a',
                specItem: 'spec_a',
                inputPath: './specs/spec_a.yaml',
                outputPath: 'src/api/spec_a/models/User.ts',
            });
            await store.writeArtifact(relativeArtifactPath, 'export interface IUser {}');
            await store.save();

            const gcResult = await store.gc(new Set());
            assert.deepEqual(gcResult.deletedKeys, [entry.artifactKey]);
            assert.equal(Object.keys(store.getManifest().artifacts).length, 0);
            assert.equal(fs.existsSync(store.resolveArtifactPath(relativeArtifactPath)), false);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });
});
