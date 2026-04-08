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
    test('detects RENAME miracle for property rename with small name distance', async () => {
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
        const report = JSON.parse(reportRaw) as { miracles?: Array<{ type: string; oldPath: string; newPath: string; confidence: number; status: string }> };

        assert.ok(Array.isArray(report.miracles), 'Expected miracles array in report');
        const rename = report.miracles?.find(m => m.type === 'RENAME');
        assert.ok(rename, 'Expected RENAME miracle');
        assert.strictEqual(rename?.oldPath, '$.components.schemas.User.properties.first_name');
        assert.strictEqual(rename?.newPath, '$.components.schemas.User.properties.firstName');
        assert.ok(typeof rename?.confidence === 'number' && rename!.confidence > 0.7, `Expected high confidence, got ${rename?.confidence}`);
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
                                path: '$.components.schemas.User.properties.age.type',
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
            diff?: { all?: unknown[] };
            miracles?: Array<{ type: string; oldPath: string; newPath: string; confidence: number; status: string }>;
        };

        // the type diff entry should be filtered by valid path rule; report should still contain TYPE_COERCION miracle
        const diffCount = report.diff?.all?.length ?? 0;
        assert.ok(diffCount <= 1, `Expected diff entries to be filtered (got ${diffCount})`);
        const coercion = report.miracles?.find(m => m.type === 'TYPE_COERCION');
        assert.ok(coercion, 'Expected TYPE_COERCION miracle even when diff entries are ignored');
    });
});
