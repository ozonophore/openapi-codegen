import assert from 'node:assert';
import { describe, test } from 'node:test';

import { analyzeUsageOptionsSchema } from '../../schemas/analyzeUsage';

describe('@unit: analyzeUsageOptionsSchema', () => {
    test('accepts commander-aligned options', () => {
        const parsed = analyzeUsageOptionsSchema.safeParse({
            sourcePath: './generated/index.ts',
            projectPath: '.',
            tsconfigPath: './tsconfig.json',
            output: './api-report.json',
            check: true,
            diffReport: './openapi-diff-report.json',
        });

        assert.strictEqual(parsed.success, true);
    });

    test('requires sourcePath and projectPath', () => {
        const parsed = analyzeUsageOptionsSchema.safeParse({
            output: 'api-report.json',
        });

        assert.strictEqual(parsed.success, false);
        if (!parsed.success) {
            const paths = parsed.error.issues.map(issue => issue.path.join('.'));
            assert.ok(paths.includes('sourcePath'));
            assert.ok(paths.includes('projectPath'));
        }
    });

    test('defaults output to api-report.json', () => {
        const parsed = analyzeUsageOptionsSchema.safeParse({
            sourcePath: './generated/index.ts',
            projectPath: '.',
        });

        assert.strictEqual(parsed.success, true);
        if (parsed.success) {
            assert.strictEqual(parsed.data.output, 'api-report.json');
        }
    });
});
