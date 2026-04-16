import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import { analyzeDiff } from '../analyzeDiff';

const writeSpec = (dir: string, filename: string, payload: unknown): string => {
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    return filePath;
};

describe('@unit: analyzeDiff RENAME and invalid-regex handling', () => {
    test('detects semantic remove/add entries for property rename-like change', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-diff-rename-'));
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
        const report = JSON.parse(reportRaw) as {
            changes: Array<{ type: string; path: string; severity: string }>;
        };

        const removed = report.changes.find(change => change.type === 'model.property.removed' && change.path === '#/components/schemas/User/properties/first_name');
        const added = report.changes.find(change => change.type === 'model.property.added' && change.path === '#/components/schemas/User/properties/firstName');

        assert.ok(removed, 'Expected semantic removal entry for previous property');
        assert.ok(added, 'Expected semantic addition entry for renamed property');
        assert.strictEqual(removed?.severity, 'breaking');
        assert.strictEqual(added?.severity, 'non-breaking');
    });

    test('invalid regex in config does not crash and valid rules still apply', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-diff-invalidregex-'));
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
                2,
            ),
            'utf-8',
        );

        const result = await analyzeDiff({
            input: currentPath,
            compareWith: previousPath,
            outputReport: reportPath,
            openapiConfig: configPath,
        });

        assert.ok(result.success, `analyzeDiff failed: ${result.error ?? 'unknown'}`);

        const reportRaw = fs.readFileSync(reportPath, 'utf-8');
        const report = JSON.parse(reportRaw) as {
            summary: { breaking: number; nonBreaking: number; informational: number };
            recommendation: { semver: string };
            changes: Array<{ type: string; path: string }>;
        };

        const filteredTypeChange = report.changes.find(change => change.type === 'model.property.type.changed' && change.path === '#/components/schemas/User/properties/age');
        assert.ok(!filteredTypeChange, 'Expected matching semantic change to be filtered by valid rule while invalid regex is ignored');
        assert.strictEqual(report.summary.breaking, 0);
        assert.strictEqual(report.summary.nonBreaking, 0);
        assert.strictEqual(report.summary.informational, 0);
        assert.strictEqual(report.recommendation.semver, 'patch');
    });
});
