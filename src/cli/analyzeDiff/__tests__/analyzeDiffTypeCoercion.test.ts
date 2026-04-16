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

describe('@unit: analyzeDiff TYPE_COERCION miracles', () => {
    test('detects semantic type change for scalar property transition', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-diff-test-'));
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

        const result = await analyzeDiff({
            input: currentPath,
            compareWith: previousPath,
            outputReport: reportPath,
        });

        assert.ok(result.success, `analyzeDiff failed: ${result.error ?? 'unknown error'}`);

        const reportRaw = fs.readFileSync(reportPath, 'utf-8');
        const report = JSON.parse(reportRaw) as {
            summary: { breaking: number };
            changes: Array<{ type: string; path: string; severity: string }>;
        };

        const typeChange = report.changes.find(change => change.type === 'model.property.type.changed');
        assert.ok(typeChange, 'Expected semantic type-change entry');
        assert.strictEqual(typeChange?.path, '#/components/schemas/User/properties/age');
        assert.strictEqual(typeChange?.severity, 'breaking');
        assert.ok(report.summary.breaking > 0);
    });

    test('filters semantic type-change entry when rule matches path', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-diff-test-'));
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

        assert.ok(result.success, `analyzeDiff failed: ${result.error ?? 'unknown error'}`);

        const reportRaw = fs.readFileSync(reportPath, 'utf-8');
        const report = JSON.parse(reportRaw) as {
            summary: { breaking: number; nonBreaking: number; informational: number };
            recommendation: { semver: string };
            changes: Array<{ type: string; path: string }>;
        };

        const filteredTypeChange = report.changes.find(change => change.type === 'model.property.type.changed' && change.path === '#/components/schemas/User/properties/age');
        assert.ok(!filteredTypeChange, 'Expected semantic type-change to be filtered by analyze.ignore');
        assert.strictEqual(report.summary.breaking, 0);
        assert.strictEqual(report.summary.nonBreaking, 0);
        assert.strictEqual(report.summary.informational, 0);
        assert.strictEqual(report.recommendation.semver, 'patch');
    });
});
