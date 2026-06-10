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

    test('loads semantic report (schemaVersion 1.1.0) and converts to legacy diff', async t => {
        const dir = createTempDir(t, 'semantic-report-');
        const reportPath = path.join(dir, 'semantic-report.json');
        const semanticReport = {
            schemaVersion: '1.1.0',
            summary: { breaking: 1, nonBreaking: 0, informational: 0 },
            recommendation: {
                semver: 'major',
                confidence: 'high',
                reason: 'Breaking changes detected.',
                reasons: ['HAS_BREAKING_CHANGES'],
            },
            governance: {
                summary: { errors: 0, warnings: 0, info: 0 },
                violations: [],
            },
            changes: [
                {
                    type: 'model.property.type.changed',
                    severity: 'breaking',
                    path: '#/components/schemas/User/properties/age',
                    message: 'type changed',
                    from: 'string',
                    to: 'integer',
                },
                {
                    type: 'model.property.removed',
                    severity: 'breaking',
                    path: '#/components/schemas/User/properties/first_name',
                    message: 'removed',
                    from: { type: 'string' },
                },
                {
                    type: 'model.property.added',
                    severity: 'non-breaking',
                    path: '#/components/schemas/User/properties/firstName',
                    message: 'added',
                    to: { type: 'string' },
                },
            ],
            miracles: [
                {
                    oldPath: '$.components.schemas.User.properties.age',
                    newPath: '$.components.schemas.User.properties.age',
                    type: 'TYPE_COERCION',
                    confidence: 1,
                    status: 'auto-generated',
                },
                {
                    oldPath: '$.components.schemas.User.properties.first_name',
                    newPath: '$.components.schemas.User.properties.firstName',
                    type: 'RENAME',
                    confidence: 1,
                    status: 'auto-generated',
                },
            ],
        };
        fs.writeFileSync(reportPath, JSON.stringify(semanticReport), 'utf-8');

        const loaded = loadDiffReport({
            diffReport: reportPath,
            logger: createLogger(),
        });

        assert.ok(loaded);
        assert.strictEqual(loaded?.version, '1.1.0');
        assert.strictEqual(loaded?.diff?.all?.length, 3);
        assert.ok(loaded?.diff?.all?.some(entry => entry.path.endsWith('.type') && entry.action === 'changed'));
        assert.strictEqual(loaded?.miracles?.length, 2);
        assert.ok(loaded?.miracles?.some(miracle => miracle.type === 'RENAME'));
        assert.ok(loaded?.miracles?.some(miracle => miracle.type === 'TYPE_COERCION'));
    });

    test('loads unified report (schemaVersion 2.0.0) and returns structural legacy diff', async t => {
        const dir = createTempDir(t, 'unified-report-');
        const reportPath = path.join(dir, 'unified-report.json');
        const unifiedReport = {
            schemaVersion: '2.0.0',
            timestamp: '2026-01-01T00:00:00.000Z',
            metadata: {
                base: 'old.json',
                target: 'new.json',
                baseHash: 'old-hash',
                targetHash: 'new-hash',
            },
            semantic: {
                summary: { breaking: 1, nonBreaking: 0, informational: 0 },
                recommendation: {
                    semver: 'major',
                    confidence: 'high',
                    reason: 'Breaking changes detected.',
                    reasons: ['HAS_BREAKING_CHANGES'],
                },
                governance: {
                    summary: { errors: 0, warnings: 0, info: 0 },
                    violations: [],
                },
                changes: [
                    {
                        type: 'model.property.removed',
                        severity: 'breaking',
                        path: '#/components/schemas/User/properties/name',
                        message: 'removed',
                    },
                ],
            },
            structural: {
                diff: {
                    breaking: [{ action: 'removed', path: '$.components.schemas.User.properties.name', severity: 'breaking' }],
                    warnings: [],
                    info: [],
                    all: [{ action: 'removed', path: '$.components.schemas.User.properties.name', severity: 'breaking' }],
                },
                miracles: [],
                stats: {
                    totalChanges: 1,
                    added: 0,
                    removed: 1,
                    changed: 0,
                    stabilityScore: 0,
                },
            },
        };
        fs.writeFileSync(reportPath, JSON.stringify(unifiedReport), 'utf-8');

        const loaded = loadDiffReport({
            diffReport: reportPath,
            logger: createLogger(),
        });

        assert.ok(loaded);
        assert.strictEqual(loaded?.version, '2.0.0');
        assert.strictEqual(loaded?.metadata?.base, 'old.json');
        assert.strictEqual(loaded?.diff?.all?.length, 1);
        assert.strictEqual(loaded?.stats?.stabilityScore, 0);
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
