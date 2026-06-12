import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import type { UnifiedDiffReport } from '../../../core/types/DiffReport.model';
import { installSilenceAppLogger } from '../../../test/helpers/silenceLoggers';
import { analyzeDiff } from '../analyzeDiff';

const generatedRoot = path.join(__dirname, 'generated');

const createTempDir = (t: TestContext, prefix: string): string => {
    fs.mkdirSync(generatedRoot, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

describe('@unit: analyzeDiff lom miracles', () => {
    let restoreAppLogger: (() => void) | undefined;

    beforeEach(() => {
        restoreAppLogger = installSilenceAppLogger();
    });

    afterEach(() => {
        restoreAppLogger?.();
        restoreAppLogger = undefined;
    });

    test('builds changes and miracles for lom v1 vs v2 specs', async t => {
        const tmpDir = createTempDir(t, 'lom-diff-');
        const reportPath = path.join(tmpDir, 'report.json');
        const specRoot = path.join(__dirname, '../../../../test/spec/lom');

        const result = await analyzeDiff({
            input: path.join(specRoot, 'lom_api.v2.yaml'),
            compareWith: path.join(specRoot, 'lom_api.v1.yaml'),
            outputReport: reportPath,
        });

        assert.ok(result.success, result.error);
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8')) as UnifiedDiffReport;

        assert.ok(report.semantic.changes.length > 0, 'expected semantic changes');
        assert.ok(report.structural.miracles.length > 0, 'expected miracles in report');
        assert.ok(report.structural.miracles.some(miracle => miracle.type === 'RENAME'));
        assert.ok(report.structural.miracles.some(miracle => miracle.type === 'TYPE_COERCION'));
        assert.ok(report.semantic.changes.some(change => change.type === 'model.property.type.changed'));
    });
});
