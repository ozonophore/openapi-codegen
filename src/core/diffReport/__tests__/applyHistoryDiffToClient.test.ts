import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../../common/Consts';
import { ELogLevel, ELogOutput } from '../../../common/Enums';
import { Logger } from '../../../common/Logger';
import { LOGGER_MESSAGES } from '../../../common/LoggerMessages';
import type { Context } from '../../Context';
import type { Client } from '../../types/shared/Client.model';
import { OpenApiVersion } from '../../utils/getOpenApiVersion';
import { applyHistoryDiffToClient } from '../applyHistoryDiffToClient';

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
        instanceId: 'apply-history-diff-test',
        level: ELogLevel.ERROR,
        logOutput: ELogOutput.CONSOLE,
        disableColors: true,
    });

const createClient = (): Client => ({
    version: '1.0.0',
    server: 'http://localhost',
    models: [],
    services: [],
});

const createContext = (): Context =>
    ({
        prefix: { interface: 'I', enum: 'E', type: 'T' },
    }) as Context;

describe('@unit: applyHistoryDiffToClient', () => {
    test('returns client unchanged when useHistory is false', () => {
        const client = createClient();
        const warnings: string[] = [];
        const logger = createLogger();
        logger.warn = (message: string) => {
            warnings.push(message);
        };

        const result = applyHistoryDiffToClient({
            client,
            openApi: { openapi: '3.0.0', info: { title: 't', version: '1' }, paths: {} },
            openApiVersion: OpenApiVersion.V3,
            context: createContext(),
            useHistory: false,
            logger,
        });

        assert.equal(result, client);
        assert.equal(warnings.length, 0);
    });

    test('warns and returns client when useHistory and report missing', () => {
        const client = createClient();
        const warnings: string[] = [];
        const logger = createLogger();
        logger.warn = (message: string) => {
            warnings.push(message);
        };

        const result = applyHistoryDiffToClient({
            client,
            openApi: { openapi: '3.0.0', info: { title: 't', version: '1' }, paths: {} },
            openApiVersion: OpenApiVersion.V3,
            context: createContext(),
            useHistory: true,
            diffReport: path.join(__dirname, 'missing-history-report.json'),
            logger,
        });

        assert.equal(result, client);
        assert.equal(warnings.length, 1);
        assert.equal(warnings[0], LOGGER_MESSAGES.DIFF_REPORT.USE_HISTORY_NO_REPORT(path.join(__dirname, 'missing-history-report.json')));
    });

    test('warns with default report path when diffReport omitted', () => {
        const warnings: string[] = [];
        const logger = createLogger();
        logger.warn = (message: string) => {
            warnings.push(message);
        };

        applyHistoryDiffToClient({
            client: createClient(),
            openApi: { openapi: '3.0.0', info: { title: 't', version: '1' }, paths: {} },
            openApiVersion: OpenApiVersion.V3,
            context: createContext(),
            useHistory: true,
            logger,
        });

        assert.equal(warnings[0], LOGGER_MESSAGES.DIFF_REPORT.USE_HISTORY_NO_REPORT(DEFAULT_ANALYZE_DIFF_REPORT_PATH));
    });

    test('applies loaded report without warning', t => {
        const dir = createTempDir(t, 'history-diff-');
        const reportPath = path.join(dir, 'report.json');
        fs.writeFileSync(
            reportPath,
            JSON.stringify({
                diff: {
                    all: [{ action: 'changed', path: '$.info.version', severity: 'info', from: '1', to: '2' }],
                },
            }),
            'utf-8'
        );

        const warnings: string[] = [];
        const logger = createLogger();
        logger.warn = (message: string) => {
            warnings.push(message);
        };

        const client = createClient();
        const result = applyHistoryDiffToClient({
            client,
            openApi: { openapi: '3.0.0', info: { title: 't', version: '1' }, paths: {} },
            openApiVersion: OpenApiVersion.V3,
            context: createContext(),
            useHistory: true,
            diffReport: reportPath,
            logger,
        });

        assert.equal(warnings.length, 0);
        assert.ok(result);
        assert.equal(result.version, '1.0.0');
    });
});
