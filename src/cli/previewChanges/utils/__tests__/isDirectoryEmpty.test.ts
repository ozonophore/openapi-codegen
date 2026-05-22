import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { isDirectoryEmpty } from '../isDirectoryEmpty';

const createTempDir = (t: TestContext, prefix: string): string => {
    const root = path.join(__dirname, 'generated');
    fs.mkdirSync(root, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(root, prefix));
    t.after(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

describe('@unit: isDirectoryEmpty', () => {
    test('returns true for missing directory', async () => {
        const result = await isDirectoryEmpty(path.join(__dirname, 'missing-dir-never-exists'));
        assert.strictEqual(result, true);
    });

    test('returns true for empty directory', async t => {
        const dir = createTempDir(t, 'empty-dir-');
        const result = await isDirectoryEmpty(dir);
        assert.strictEqual(result, true);
    });

    test('returns false for directory with entries', async t => {
        const dir = createTempDir(t, 'nonempty-dir-');
        fs.writeFileSync(path.join(dir, 'file.txt'), 'content');
        const result = await isDirectoryEmpty(dir);
        assert.strictEqual(result, false);
    });

    test('returns true when path is a file', async t => {
        const dir = createTempDir(t, 'file-path-');
        const filePath = path.join(dir, 'not-dir.txt');
        fs.writeFileSync(filePath, 'x');
        const result = await isDirectoryEmpty(filePath);
        assert.strictEqual(result, true);
    });
});
