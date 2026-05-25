import assert from 'node:assert';
import { describe, test } from 'node:test';

import { previewChangesSchema } from '../previewChanges';

describe('@unit: previewChangesSchema', () => {
    test('accepts preview directories', () => {
        const parsed = previewChangesSchema.safeParse({
            generatedDir: './test/generated',
            previewDir: './generated-preview',
            diffDir: './diff-preview',
        });
        assert.strictEqual(parsed.success, true);
    });

    test('treats empty strings as undefined', () => {
        const parsed = previewChangesSchema.safeParse({
            generatedDir: '',
            previewDir: '',
            diffDir: '',
        });
        assert.strictEqual(parsed.success, true);
        if (parsed.success) {
            assert.strictEqual(parsed.data.generatedDir, undefined);
            assert.strictEqual(parsed.data.previewDir, undefined);
            assert.strictEqual(parsed.data.diffDir, undefined);
        }
    });
});
