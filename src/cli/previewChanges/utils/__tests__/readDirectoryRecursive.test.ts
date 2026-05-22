import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { readDirectoryRecursive } from '../readDirectoryRecursive';

const createTempDir = (t: TestContext, prefix: string): string => {
    const root = path.join(__dirname, 'generated');
    fs.mkdirSync(root, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(root, prefix));
    t.after(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

describe('@unit: readDirectoryRecursive', () => {
    test('returns relative paths for nested files', async t => {
        const dir = createTempDir(t, 'read-recursive-');
        const nested = path.join(dir, 'nested');
        fs.mkdirSync(nested, { recursive: true });
        fs.writeFileSync(path.join(dir, 'root.ts'), 'export {}');
        fs.writeFileSync(path.join(nested, 'child.ts'), 'export {}');

        const files = await readDirectoryRecursive(dir);

        assert.ok(files.includes('root.ts'));
        assert.ok(files.some(file => file.endsWith('child.ts')));
        assert.strictEqual(files.length, 2);
    });
});
