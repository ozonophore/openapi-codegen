import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { ELogLevel, ELogOutput } from '../../../common/Enums';
import { Logger } from '../../../common/Logger';
import { loadDiffReport } from '../loadDiffReport';

const createTempDir = (t: TestContext, prefix: string): string => {
    const root = path.join(__dirname, 'generated');
    fs.mkdirSync(root, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(root, prefix));
    t.after(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

const createLogger = (): Logger =>
    new Logger({
        instanceId: 'load-diff-report-test',
        level: ELogLevel.ERROR,
        logOutput: ELogOutput.CONSOLE,
        disableColors: true,
    });

describe('@unit: loadDiffReport', () => {
    test('returns null when history and diffReport path are disabled', () => {
        const result = loadDiffReport({
            useHistory: false,
            logger: createLogger(),
        });
        assert.strictEqual(result, null);
    });

    test('returns null when report file is missing', () => {
        const result = loadDiffReport({
            useHistory: true,
            diffReport: path.join(__dirname, 'missing-report.json'),
            logger: createLogger(),
        });
        assert.strictEqual(result, null);
    });

    test('loads report with diff entries', async t => {
        const dir = createTempDir(t, 'diff-report-');
        const reportPath = path.join(dir, 'report.json');
        const report = {
            diff: {
                all: [{ action: 'changed', path: '$.info.version', severity: 'info', from: '1', to: '2' }],
            },
        };
        fs.writeFileSync(reportPath, JSON.stringify(report), 'utf-8');

        const loaded = loadDiffReport({
            diffReport: reportPath,
            logger: createLogger(),
        });

        assert.ok(loaded);
        assert.strictEqual(loaded?.diff?.all?.length, 1);
    });

    test('returns null for empty report without diff or miracles', async t => {
        const dir = createTempDir(t, 'diff-report-empty-');
        const reportPath = path.join(dir, 'empty.json');
        fs.writeFileSync(reportPath, JSON.stringify({ diff: { all: [] }, miracles: [] }), 'utf-8');

        const loaded = loadDiffReport({
            diffReport: reportPath,
            logger: createLogger(),
        });

        assert.strictEqual(loaded, null);
    });

    test('returns null when report is older than input spec', async t => {
        const dir = createTempDir(t, 'diff-report-stale-');
        const reportPath = path.join(dir, 'report.json');
        const inputPath = path.join(dir, 'spec.json');

        fs.writeFileSync(
            reportPath,
            JSON.stringify({
                diff: { all: [{ action: 'changed', path: '$.info.version', severity: 'info' }] },
            }),
            'utf-8'
        );

        const past = Date.now() - 60_000;
        fs.utimesSync(reportPath, past / 1000, past / 1000);
        fs.writeFileSync(inputPath, '{"openapi":"3.0.0"}', 'utf-8');

        const loaded = loadDiffReport({
            diffReport: reportPath,
            inputPath,
            logger: createLogger(),
        });

        assert.strictEqual(loaded, null);
    });

    test('returns null when report JSON is invalid', async t => {
        const dir = createTempDir(t, 'diff-report-broken-');
        const reportPath = path.join(dir, 'broken.json');
        fs.writeFileSync(reportPath, '{ not-json', 'utf-8');

        const loaded = loadDiffReport({
            diffReport: reportPath,
            logger: createLogger(),
        });

        assert.strictEqual(loaded, null);
    });
});
