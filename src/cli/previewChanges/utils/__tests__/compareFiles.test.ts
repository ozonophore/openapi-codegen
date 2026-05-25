import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { compareFiles } from '../compareFiles';
import { formatDiff } from '../formatDiff';

const createTempDir = (t: TestContext, prefix: string): string => {
    const root = path.join(__dirname, 'generated');
    fs.mkdirSync(root, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(root, prefix));
    t.after(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

describe('@unit: compareFiles and formatDiff', () => {
    test('compareFiles returns null when files are identical', async t => {
        const dir = createTempDir(t, 'compare-same-');
        const filePath = path.join(dir, 'same.ts');
        fs.writeFileSync(filePath, 'line1\nline2\n', 'utf-8');

        const diff = await compareFiles(filePath, filePath);
        assert.strictEqual(diff, null);
    });

    test('compareFiles returns diff when content changed', async t => {
        const dir = createTempDir(t, 'compare-diff-');
        const oldPath = path.join(dir, 'old.ts');
        const newPath = path.join(dir, 'new.ts');
        fs.writeFileSync(oldPath, 'alpha\n', 'utf-8');
        fs.writeFileSync(newPath, 'beta\n', 'utf-8');

        const fileDiff = await compareFiles(oldPath, newPath);
        assert.ok(fileDiff);
        assert.ok(fileDiff.some(part => part.added || part.removed));
    });

    test('formatDiff renders added, removed, and modified statuses', () => {
        const added = formatDiff('new.ts', 'added');
        assert.match(added, /new file/i);

        const removed = formatDiff('old.ts', 'removed');
        assert.match(removed, /deleted/i);

        const modified = formatDiff('changed.ts', 'modified', [
            { value: 'old\n', removed: true, added: false, count: 0 },
            { value: 'new\n', removed: false, added: true, count: 0 },
        ]);
        assert.match(modified, /```diff/);
        assert.match(modified, /\+\s*new/);
        assert.match(modified, /-\s*old/);
    });
});
