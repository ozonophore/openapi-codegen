import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

import { createTempDir } from '../../../../test/helpers/createTempDir';
import { readDirectoryRecursive } from '../readDirectoryRecursive';

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
