import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { WriteClient } from '../../WriteClient';
import { buildCoreTransportFingerprint } from '../coreTransportFingerprint';
import { SharedFolderWriter } from '../SharedFolderWriter';
import { writeSharedOrLocalCoreFile } from '../writeSharedCoreFile';

describe('@unit: writeSharedOrLocalCoreFile', () => {
    const tempDirs: string[] = [];

    afterEach(() => {
        for (const dir of tempDirs.splice(0)) {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    function createFixture() {
        const root = mkdtempSync(path.join(tmpdir(), 'shared-core-'));
        tempDirs.push(root);
        const lca = path.join(root, 'out');
        const itemA = path.join(lca, 'api-a', 'core');
        const itemB = path.join(lca, 'api-b', 'core');
        mkdirSync(path.join(itemA, 'executor'), { recursive: true });
        mkdirSync(path.join(itemB, 'executor'), { recursive: true });

        const writeClient = new WriteClient();
        const sharedFolderWriter = new SharedFolderWriter(writeClient, lca);
        return { lca, itemA, itemB, writeClient, sharedFolderWriter };
    }

    test('writes canonical under __shared__/core and stub for nested executor path', async () => {
        const { lca, itemA, writeClient, sharedFolderWriter } = createFixture();
        const content = 'export const requestExecutor = true;\n';

        const result = await writeSharedOrLocalCoreFile(writeClient, {
            sharedFolderWriter,
            outputCorePath: itemA,
            relativeCorePath: 'executor/requestExecutor.ts',
            content,
        });

        assert.equal(result, 'shared');
        const canonical = path.join(lca, '__shared__', 'core', 'executor', 'requestExecutor.ts');
        const stub = path.join(itemA, 'executor', 'requestExecutor.ts');
        assert.equal(readFileSync(canonical, 'utf8'), content);
        assert.match(readFileSync(stub, 'utf8'), /export \* from '/);
        assert.match(readFileSync(stub, 'utf8'), /__shared__\/core\/executor\/requestExecutor/);
    });

    test('second item with same content gets stub to shared canonical', async () => {
        const { lca, itemA, itemB, writeClient, sharedFolderWriter } = createFixture();
        const content = 'export class ApiError {}\n';

        await writeSharedOrLocalCoreFile(writeClient, {
            sharedFolderWriter,
            outputCorePath: itemA,
            relativeCorePath: 'ApiError.ts',
            content,
        });
        const result = await writeSharedOrLocalCoreFile(writeClient, {
            sharedFolderWriter,
            outputCorePath: itemB,
            relativeCorePath: 'ApiError.ts',
            content,
        });

        assert.equal(result, 'shared');
        assert.equal(readFileSync(path.join(lca, '__shared__', 'core', 'ApiError.ts'), 'utf8'), content);
        assert.match(readFileSync(path.join(itemB, 'ApiError.ts'), 'utf8'), /export \* from '/);
    });

    test('content hash conflict keeps full local file', async () => {
        const { itemA, itemB, writeClient, sharedFolderWriter } = createFixture();

        await writeSharedOrLocalCoreFile(writeClient, {
            sharedFolderWriter,
            outputCorePath: itemA,
            relativeCorePath: 'ApiRequestOptions.ts',
            content: 'export type ApiRequestOptions = { a: 1 };\n',
        });
        const result = await writeSharedOrLocalCoreFile(writeClient, {
            sharedFolderWriter,
            outputCorePath: itemB,
            relativeCorePath: 'ApiRequestOptions.ts',
            content: 'export type ApiRequestOptions = { b: 2 };\n',
        });

        assert.equal(result, 'conflict-local');
        const localB = readFileSync(path.join(itemB, 'ApiRequestOptions.ts'), 'utf8');
        assert.equal(localB, 'export type ApiRequestOptions = { b: 2 };\n');
        assert.ok(!localB.includes('export * from'));
    });

    test('request-sensitive fingerprint mismatch keeps local request.ts', async () => {
        const { itemA, itemB, writeClient, sharedFolderWriter } = createFixture();
        const fpA = buildCoreTransportFingerprint({ request: './a.ts', httpClient: 'fetch' });
        const fpB = buildCoreTransportFingerprint({ request: './b.ts', httpClient: 'fetch' });

        await writeSharedOrLocalCoreFile(writeClient, {
            sharedFolderWriter,
            outputCorePath: itemA,
            relativeCorePath: 'request.ts',
            content: 'export async function request() { return "a"; }\n',
            transportFingerprint: fpA,
        });
        const result = await writeSharedOrLocalCoreFile(writeClient, {
            sharedFolderWriter,
            outputCorePath: itemB,
            relativeCorePath: 'request.ts',
            content: 'export async function request() { return "b"; }\n',
            transportFingerprint: fpB,
        });

        assert.equal(result, 'conflict-local');
        assert.equal(readFileSync(path.join(itemB, 'request.ts'), 'utf8'), 'export async function request() { return "b"; }\n');
    });

    test('without sharedFolderWriter writes local full file only', async () => {
        const { itemA, writeClient } = createFixture();
        const result = await writeSharedOrLocalCoreFile(writeClient, {
            outputCorePath: itemA,
            relativeCorePath: 'ApiError.ts',
            content: 'export class ApiError {}\n',
        });
        assert.equal(result, 'local');
        assert.equal(readFileSync(path.join(itemA, 'ApiError.ts'), 'utf8'), 'export class ApiError {}\n');
    });
});
