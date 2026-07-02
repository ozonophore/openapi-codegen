import assert from 'node:assert';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test';

import { ELogLevel, ELogOutput } from '../../../common/Enums';
import { Logger } from '../../../common/Logger';
import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { runAnomalyDetection } from '../runAnomalyDetection';

function createTempDir(t: TestContext): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, 'anomaly-'));
    const previousCwd = process.cwd();
    process.chdir(tempDir);
    t.after(() => {
        process.chdir(previousCwd);
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

describe('@unit: runAnomalyDetection', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('writes json report to configured path', async t => {
        createTempDir(t);
        const logger = new Logger({
            instanceId: 'test',
            level: ELogLevel.ERROR,
            logOutput: ELogOutput.CONSOLE,
        });

        const spec = {
            openapi: '3.0.0',
            paths: {
                '/pets': {
                    get: {
                        responses: {
                            '200': {
                                content: {
                                    'application/json': {
                                        schema: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: { schemas: {} },
        };

        const report = await runAnomalyDetection(
            spec as any,
            {
                enabled: true,
                reportFormat: 'json',
                reportPath: './reports/anomalies.json',
            },
            logger
        );

        const reportContent = JSON.parse(readFileSync(path.resolve('./reports/anomalies.json'), 'utf8'));
        assert.ok(reportContent.perSpec || reportContent.summary);
        assert.equal(typeof report.totalAnomalies, 'number');
    });

    test('throws when failOnAnomalies is enabled and high severity findings exist', async t => {
        createTempDir(t);
        const logger = new Logger({
            instanceId: 'test',
            level: ELogLevel.ERROR,
            logOutput: ELogOutput.CONSOLE,
        });

        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    NodeA: { $ref: '#/components/schemas/NodeB' },
                    NodeB: { $ref: '#/components/schemas/NodeA' },
                },
            },
        };

        await assert.rejects(
            () =>
                runAnomalyDetection(
                    spec as any,
                    {
                        enabled: true,
                        failOnAnomalies: true,
                        severity: 'low',
                    },
                    logger
                ),
            /high-severity finding/
        );
    });

    test('passes custom prefixes to spec analysis', async t => {
        createTempDir(t);
        const logger = new Logger({
            instanceId: 'test',
            level: ELogLevel.ERROR,
            logOutput: ELogOutput.CONSOLE,
        });

        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                    XUser: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                },
            },
        };

        const report = await runAnomalyDetection(
            spec as any,
            {
                enabled: true,
                severity: 'low',
            },
            logger,
            'test-spec',
            {
                interface: 'X',
                enum: 'E',
                type: 'T',
            }
        );

        const ambiguous = report.anomalies.find(anomaly => anomaly.type === 'ambiguous-model-name');
        assert.ok(ambiguous);
        assert.ok(ambiguous!.affectedPaths?.includes('User'));
        assert.ok(ambiguous!.affectedPaths?.includes('XUser'));
    });
});
