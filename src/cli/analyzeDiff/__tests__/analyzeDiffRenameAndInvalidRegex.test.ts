import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import type { UnifiedDiffReport } from '../../../core/types/DiffReport.model';
import { installSilenceAppLogger } from '../../../test/helpers/silenceLoggers';
import { analyzeDiff } from '../analyzeDiff';

const writeSpec = (dir: string, filename: string, payload: unknown): string => {
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    return filePath;
};

const generatedRoot = path.join(__dirname, 'generated');

const createTempDir = (t: TestContext, prefix: string): string => {
    fs.mkdirSync(generatedRoot, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
};

describe('@unit: analyzeDiff RENAME and invalid-regex handling', () => {
    let restoreAppLogger: (() => void) | undefined;

    beforeEach(() => {
        restoreAppLogger = installSilenceAppLogger();
    });

    afterEach(() => {
        restoreAppLogger?.();
        restoreAppLogger = undefined;
    });

    test('detects semantic remove/add entries for property rename-like change', async t => {
        const tmpDir = createTempDir(t, 'openapi-diff-rename-');
        const reportPath = path.join(tmpDir, 'report.json');

        const previousSpec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            first_name: { type: 'string' },
                        },
                    },
                },
            },
        };

        const currentSpec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.1.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            firstName: { type: 'string' },
                        },
                    },
                },
            },
        };

        const previousPath = writeSpec(tmpDir, 'previous.json', previousSpec);
        const currentPath = writeSpec(tmpDir, 'current.json', currentSpec);

        const result = await analyzeDiff({
            input: currentPath,
            compareWith: previousPath,
            outputReport: reportPath,
        });

        assert.ok(result.success, `analyzeDiff failed: ${result.error ?? 'unknown'}`);

        const reportRaw = fs.readFileSync(reportPath, 'utf-8');
        const report = JSON.parse(reportRaw) as UnifiedDiffReport;

        const removed = report.semantic.changes.find(change => change.type === 'model.property.removed' && change.path === '#/components/schemas/User/properties/first_name');
        const added = report.semantic.changes.find(change => change.type === 'model.property.added' && change.path === '#/components/schemas/User/properties/firstName');

        assert.ok(removed, 'Expected semantic removal entry for previous property');
        assert.ok(added, 'Expected semantic addition entry for renamed property');
        assert.strictEqual(removed?.severity, 'breaking');
        assert.strictEqual(added?.severity, 'non-breaking');
        assert.ok(report.structural.miracles.some(miracle => miracle.type === 'RENAME'));
    });

    test('invalid regex in config does not crash and valid rules still apply', async t => {
        const tmpDir = createTempDir(t, 'openapi-diff-invalidregex-');
        const reportPath = path.join(tmpDir, 'report.json');

        const previousSpec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            age: { type: 'string' },
                        },
                    },
                },
            },
        };

        const currentSpec = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.1.0' },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            age: { type: 'number' },
                        },
                    },
                },
            },
        };

        const previousPath = writeSpec(tmpDir, 'previous.json', previousSpec);
        const currentPath = writeSpec(tmpDir, 'current.json', currentSpec);

        const configPath = path.join(tmpDir, 'openapi.config.json');
        fs.writeFileSync(
            configPath,
            JSON.stringify(
                {
                    analyze: {
                        ignore: [
                            {
                                pattern: '(', // invalid regex
                                reason: 'invalid pattern',
                            },
                            {
                                path: '#/components/schemas/User/properties/age',
                                reason: 'Ignore type diff in test',
                            },
                        ],
                    },
                },
                null,
                2
            ),
            'utf-8'
        );

        const result = await analyzeDiff({
            input: currentPath,
            compareWith: previousPath,
            outputReport: reportPath,
            openapiConfig: configPath,
        });

        assert.ok(result.success, `analyzeDiff failed: ${result.error ?? 'unknown'}`);

        const reportRaw = fs.readFileSync(reportPath, 'utf-8');
        const report = JSON.parse(reportRaw) as UnifiedDiffReport;

        const filteredTypeChange = report.semantic.changes.find(change => change.type === 'model.property.type.changed' && change.path === '#/components/schemas/User/properties/age');
        assert.ok(!filteredTypeChange, 'Expected matching semantic change to be filtered by valid rule while invalid regex is ignored');
        assert.strictEqual(report.semantic.summary.breaking, 0);
        assert.strictEqual(report.semantic.summary.nonBreaking, 0);
        assert.strictEqual(report.semantic.summary.informational, 0);
        assert.strictEqual(report.semantic.recommendation.semver, 'patch');
    });
});
