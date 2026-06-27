import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { resolveProjectAnalysisDir } from '../autoSelectHelpers';

describe('@unit: autoSelectHelpers', () => {
    test('resolveProjectAnalysisDir prefers output directory', () => {
        const targetDir = resolveProjectAnalysisDir({
            input: './specs/api.yaml',
            output: './generated/client',
        } as any);

        assert.equal(targetDir, path.resolve(process.cwd(), './generated/client'));
    });

    test('resolveProjectAnalysisDir uses cwd for URL input without output', () => {
        const targetDir = resolveProjectAnalysisDir({
            input: 'https://example.com/openapi.yaml',
        } as any);

        assert.equal(targetDir, process.cwd());
    });
});
