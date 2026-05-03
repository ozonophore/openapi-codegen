import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { writeFileIfChanged } from '../writeFileIfChanged';

describe('@unit: writeFileIfChanged', () => {
    test('writes new file and skips unchanged content', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'openapi-codegen-'));
        const file = join(dir, 'index.ts');

        const firstResult = await writeFileIfChanged(file, 'export const a = 1;\n');
        const secondResult = await writeFileIfChanged(file, 'export const a = 1;\n');
        const thirdResult = await writeFileIfChanged(file, 'export const a = 2;\n');

        const content = await readFile(file, 'utf8');

        assert.equal(firstResult, 'written');
        assert.equal(secondResult, 'unchanged');
        assert.equal(thirdResult, 'written');
        assert.equal(content, 'export const a = 2;\n');
    });
});
