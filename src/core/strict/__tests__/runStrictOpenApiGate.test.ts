import assert from 'node:assert';
import { describe, test } from 'node:test';

import { LOGGER_MESSAGES } from '../../../common/LoggerMessages';
import type { CommonOpenApi } from '../../types/shared/CommonOpenApi.model';
import { runStrictOpenApiGate, type StrictOpenApiGateDeps } from '../runStrictOpenApiGate';
import type { StrictOpenApiReport } from '../validateOpenApiStrict';

const openApi = { openapi: '3.0.0', paths: {} } as unknown as CommonOpenApi;
const context = {
    paths: () => [] as string[],
    get: () => ({}),
    exists: () => true,
};

function baseReport(overrides?: Partial<StrictOpenApiReport>): StrictOpenApiReport {
    return {
        summary: { errors: 0, warnings: 0, info: 0 },
        governance: { summary: { errors: 0, warnings: 0, info: 0 }, violations: [] },
        issues: [],
        ...overrides,
    };
}

function createDeps(report: StrictOpenApiReport): StrictOpenApiGateDeps {
    return {
        validateWithSwaggerParser: async () => [],
        loadGovernanceConfig: async () => undefined,
        validateOpenApiStrict: () => report,
        writeOpenApiStrictReport: async (_report, reportFile) => `/tmp/${reportFile}`,
    };
}

describe('@unit: runStrictOpenApiGate', () => {
    test('returns reportPath and logs on success', async () => {
        const logs: string[] = [];
        const result = await runStrictOpenApiGate(
            {
                absoluteInput: '/spec.yaml',
                openApi,
                context,
                reportFile: 'strict-report.json',
                logger: { forceInfo: msg => logs.push(msg) },
            },
            createDeps(baseReport())
        );

        assert.strictEqual(result.reportPath, '/tmp/strict-report.json');
        assert.deepStrictEqual(logs, [LOGGER_MESSAGES.GENERATION.STRICT_REPORT_CREATED('/tmp/strict-report.json')]);
    });

    test('throws on strict summary errors', async () => {
        await assert.rejects(
            () =>
                runStrictOpenApiGate(
                    {
                        absoluteInput: '/spec.yaml',
                        openApi,
                        context,
                        reportFile: 'strict-report.json',
                        logger: { forceInfo: () => undefined },
                    },
                    createDeps(baseReport({ summary: { errors: 2, warnings: 0, info: 0 } }))
                ),
            (err: unknown) => {
                assert.ok(err instanceof Error);
                assert.match(err.message, /Strict OpenAPI validation failed with 2 error\(s\)\. Report: \/tmp\/strict-report\.json/);
                return true;
            }
        );
    });

    test('throws on governance errors when failOnGovernanceErrors', async () => {
        await assert.rejects(
            () =>
                runStrictOpenApiGate(
                    {
                        absoluteInput: '/spec.yaml',
                        openApi,
                        context,
                        reportFile: 'strict-report.json',
                        failOnGovernanceErrors: true,
                        logger: { forceInfo: () => undefined },
                    },
                    createDeps(
                        baseReport({
                            governance: { summary: { errors: 1, warnings: 0, info: 0 }, violations: [] },
                        })
                    )
                ),
            (err: unknown) => {
                assert.ok(err instanceof Error);
                assert.match(err.message, /Governance validation failed with 1 error\(s\)\. Report: \/tmp\/strict-report\.json/);
                return true;
            }
        );
    });
});
