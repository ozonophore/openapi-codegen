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
    test('creates TYPE_COERCION miracle for scalar type change', async () => {
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
        const report = JSON.parse(reportRaw) as { miracles?: Array<{ type: string; oldPath: string; newPath: string; confidence: number; status: string }> };

        assert.ok(Array.isArray(report.miracles), 'Expected miracles array in report');
        const coercion = report.miracles?.find(miracle => miracle.type === 'TYPE_COERCION');

        assert.ok(coercion, 'Expected TYPE_COERCION miracle');
        assert.strictEqual(coercion?.oldPath, '$.components.schemas.User.properties.age');
        assert.strictEqual(coercion?.newPath, '$.components.schemas.User.properties.age');
        assert.strictEqual(coercion?.confidence, 1);
        assert.strictEqual(coercion?.status, 'auto-generated');
    });

    test('creates TYPE_COERCION miracle even when diff entries are ignored', async () => {
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

        assert.ok(result.success, `analyzeDiff failed: ${result.error ?? 'unknown error'}`);

        const reportRaw = fs.readFileSync(reportPath, 'utf-8');
        const report = JSON.parse(reportRaw) as {
            diff?: { all?: unknown[] };
            miracles?: Array<{ type: string; oldPath: string; newPath: string; confidence: number; status: string }>;
        };

        const diffCount = report.diff?.all?.length ?? 0;
        assert.ok(diffCount <= 1, `Expected diff entries to be filtered (got ${diffCount})`);
        const coercion = report.miracles?.find(miracle => miracle.type === 'TYPE_COERCION');
        assert.ok(coercion, 'Expected TYPE_COERCION miracle even when diff entries are ignored');
        assert.strictEqual(coercion?.oldPath, '$.components.schemas.User.properties.age');
        assert.strictEqual(coercion?.newPath, '$.components.schemas.User.properties.age');
    });
});
