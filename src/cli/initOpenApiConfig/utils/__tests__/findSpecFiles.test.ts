import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { findSpecFiles } from '../findSpecFiles';

const createTempDir = (t: TestContext, prefix: string): string => {
    const root = path.join(__dirname, 'generated');
    fs.mkdirSync(root, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(root, prefix));
    t.after(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

describe('@unit: findSpecFiles', () => {
    test('returns spec files with supported extensions', async t => {
        const dir = createTempDir(t, 'find-specs-');
        fs.writeFileSync(path.join(dir, 'api.json'), '{}');
        fs.writeFileSync(path.join(dir, 'api.yml'), 'openapi: 3.0.0');
        fs.writeFileSync(path.join(dir, 'api.yaml'), 'openapi: 3.0.0');
        fs.writeFileSync(path.join(dir, 'readme.txt'), 'skip');

        const files = await findSpecFiles(dir);

        assert.strictEqual(files.length, 3);
        assert.ok(files.every(file => /\.(json|ya?ml)$/i.test(file)));
    });

    test('throws when directory does not exist', async () => {
        await assert.rejects(
            () => findSpecFiles(path.join(__dirname, 'missing-dir-never-exists')),
            /Directory does not exist/
        );
    });

    test('throws when path is not a directory', async t => {
        const dir = createTempDir(t, 'find-specs-file-');
        const filePath = path.join(dir, 'not-a-dir.json');
        fs.writeFileSync(filePath, '{}');

        await assert.rejects(() => findSpecFiles(filePath), /Path is not a directory/);
    });

    test('returns empty array for directory without specs', async t => {
        const dir = createTempDir(t, 'find-specs-empty-');
        const files = await findSpecFiles(dir);
        assert.deepStrictEqual(files, []);
    });
});
