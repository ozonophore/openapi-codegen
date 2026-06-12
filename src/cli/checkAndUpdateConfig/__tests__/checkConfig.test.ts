import assert from 'node:assert';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, mock, test } from 'node:test';

import { APP_LOGGER } from '../../../common/Consts';
import { ELogLevel, ELogOutput } from '../../../common/Enums';
import { EmptySchemaStrategy } from '../../../core/types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
import { ValidationLibrary } from '../../../core/types/enums/ValidationLibrary.enum';
import { checkConfig } from '../checkConfig';

/** Minimal flat config aligned with validateAndMigrateConfigData fixtures (non-default httpClient). */
const flatConfig = {
    input: './test/spec/v3.json',
    output: './test/generated',
    httpClient: HttpClient.AXIOS,
    validationLibrary: ValidationLibrary.NONE,
    logLevel: ELogLevel.ERROR,
    logTarget: ELogOutput.CONSOLE,
    emptySchemaStrategy: EmptySchemaStrategy.KEEP,
};

/** Prevent enquirer prompts when tests run with a TTY-attached stdin. */
function disableInteractiveStdin(): void {
    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });
}

async function writeConfig(dir: string, content: unknown): Promise<string> {
    const configPath = join(dir, 'openapi.config.json');
    await writeFile(configPath, JSON.stringify(content, null, 2), 'utf8');
    return configPath;
}

describe('@unit: checkConfig', () => {
    let originalIsTTY: boolean | undefined;

    beforeEach(() => {
        originalIsTTY = process.stdin.isTTY;
        disableInteractiveStdin();
    });

    afterEach(() => {
        Object.defineProperty(process.stdin, 'isTTY', { value: originalIsTTY, configurable: true });
    });

    test('returns failure when options fail schema validation', async () => {
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);
        const errorMock = mock.method(APP_LOGGER, 'error', () => undefined);

        const result = await checkConfig({ openapiConfig: 123 });

        assert.strictEqual(result.success, false);
        assert.ok(result.error);

        shutdownMock.mock.restore();
        errorMock.mock.restore();
    });

    test('returns failure when config file is missing', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'check-config-'));
        const configPath = join(dir, 'missing.json');
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);

        const result = await checkConfig({ openapiConfig: configPath });

        assert.strictEqual(result.success, false);
        assert.ok(result.error);

        shutdownMock.mock.restore();
    });

    test('returns success for valid up-to-date config without blocking on stdin', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'check-config-'));
        const configPath = await writeConfig(dir, flatConfig);
        const infoMock = mock.method(APP_LOGGER, 'info', () => undefined);
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);

        const result = await checkConfig({ openapiConfig: configPath });

        assert.strictEqual(result.success, true);
        assert.strictEqual(infoMock.mock.callCount(), 2);

        infoMock.mock.restore();
        shutdownMock.mock.restore();
    });
});
