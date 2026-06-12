import assert from 'node:assert';
import { describe, test } from 'node:test';

import { DEFAULT_ANALYZE_DIFF_REPORT_PATH, DEFAULT_ANALYZE_USAGE_REPORT_PATH } from '../../../common/Consts';
import { analyzeUsageOptionsSchema } from '../../schemas/analyzeUsage';

describe('@unit: analyzeUsageOptionsSchema', () => {
    test('accepts commander-aligned options', () => {
        const parsed = analyzeUsageOptionsSchema.safeParse({
            sourcePath: './generated/index.ts',
            projectPath: '.',
            tsconfigPath: './tsconfig.json',
            output: DEFAULT_ANALYZE_USAGE_REPORT_PATH,
            check: true,
            diffReport: DEFAULT_ANALYZE_DIFF_REPORT_PATH,
        });

        assert.strictEqual(parsed.success, true);
    });

    test('requires sourcePath and projectPath', () => {
        const parsed = analyzeUsageOptionsSchema.safeParse({
            output: DEFAULT_ANALYZE_USAGE_REPORT_PATH,
        });

        assert.strictEqual(parsed.success, false);
        if (!parsed.success) {
            const paths = parsed.error.issues.map(issue => issue.path.join('.'));
            assert.ok(paths.includes('sourcePath'));
            assert.ok(paths.includes('projectPath'));
        }
    });

    test('defaults output to openapi-usage-report.json in reports dir', () => {
        const parsed = analyzeUsageOptionsSchema.safeParse({
            sourcePath: './generated/index.ts',
            projectPath: '.',
        });

        assert.strictEqual(parsed.success, true);
        if (parsed.success) {
            assert.strictEqual(parsed.data.output, DEFAULT_ANALYZE_USAGE_REPORT_PATH);
        }
    });
});
