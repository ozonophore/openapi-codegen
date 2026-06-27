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
                '/pets/batch': { post: { responses: { '200': { description: 'ok' } } } },
                '/pets': { post: { responses: { '200': { description: 'ok' } } } },
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
        assert.equal(report.totalAnomalies, reportContent.totalAnomalies);
        assert.ok(reportContent.anomalies);
    });

    test('throws when failOnAnomalies is enabled and critical anomalies exist', async t => {
        createTempDir(t);
        const logger = new Logger({
            instanceId: 'test',
            level: ELogLevel.ERROR,
            logOutput: ELogOutput.CONSOLE,
        });

        const spec = {
            openapi: '3.0.0',
            paths: {
                '/items/batch': { post: { responses: { '200': { description: 'ok' } } } },
                '/items': { post: { responses: { '200': { description: 'ok' } } } },
            },
            components: { schemas: {} },
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
            /critical anomaly/
        );
    });
});
