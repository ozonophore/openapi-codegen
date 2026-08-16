import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { resolveHelper } from '../../common/utils/pathHelpers';
import { OutputFileSession } from '../OutputFileSession';

describe('@unit: OutputFileSession', () => {
    const tempDirs: string[] = [];

    afterEach(() => {
        for (const dir of tempDirs.splice(0)) {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('registers native join paths so resolveHelper lookup matches', () => {
        const root = mkdtempSync(path.join(tmpdir(), 'output-files-'));
        tempDirs.push(root);
        const nativePath = path.join(root, 'out', '__shared__', 'core', 'ApiError.ts');
        const session = new OutputFileSession();

        session.registerOutputFile(nativePath);

        assert.ok(session.getExpectedOutputFiles().has(resolveHelper(nativePath)));
    });

    test('writeOutputFile stores the resolveHelper path in the expected set', async () => {
        const root = mkdtempSync(path.join(tmpdir(), 'output-write-'));
        tempDirs.push(root);
        const nativePath = path.join(root, 'ApiError.ts');
        const session = new OutputFileSession();

        await session.writeOutputFile(nativePath, 'export class ApiError {}\n');

        assert.ok(session.getExpectedOutputFiles().has(resolveHelper(nativePath)));
    });
});
