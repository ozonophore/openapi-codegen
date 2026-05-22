import assert from 'node:assert';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, mock, test } from 'node:test';

import { APP_LOGGER } from '../../../common/Consts';
import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
import { updateConfig } from '../updateConfig';

class ProcessExitError extends Error {
    constructor(public readonly exitCode: number) {
        super(`process.exit(${exitCode})`);
        this.name = 'ProcessExitError';
    }
}

const flatConfig = {
    input: './test/spec/v3.json',
    output: './test/generated',
    httpClient: HttpClient.FETCH,
};

const mockProcessExit = () =>
    mock.method(process, 'exit', (code?: string | number | null | undefined) => {
        throw new ProcessExitError(Number(code ?? 0));
    });

async function writeConfig(dir: string, content: unknown): Promise<string> {
    const configPath = join(dir, 'openapi.config.json');
    await writeFile(configPath, JSON.stringify(content, null, 2), 'utf8');
    return configPath;
}

describe('@unit: updateConfig', () => {
    test('exits when options fail schema validation', async () => {
        const exitMock = mockProcessExit();
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);
        const errorMock = mock.method(APP_LOGGER, 'error', () => undefined);

        await assert.rejects(
            () => updateConfig({ openapiConfig: 123 }),
            ProcessExitError,
        );

        exitMock.mock.restore();
        shutdownMock.mock.restore();
        errorMock.mock.restore();
    });

    test('exits when config file is missing', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'update-config-'));
        const configPath = join(dir, 'missing.json');
        const exitMock = mockProcessExit();
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);

        await assert.rejects(
            () => updateConfig({ openapiConfig: configPath }),
            ProcessExitError,
        );

        exitMock.mock.restore();
        shutdownMock.mock.restore();
    });

    test('logs up to date when config is current', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'update-config-'));
        const configPath = await writeConfig(dir, flatConfig);
        const infoMock = mock.method(APP_LOGGER, 'info', () => undefined);

        await updateConfig({ openapiConfig: configPath });

        assert.strictEqual(infoMock.mock.callCount(), 1);

        infoMock.mock.restore();
    });
});
