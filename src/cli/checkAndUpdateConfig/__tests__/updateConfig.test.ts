import assert from 'node:assert';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, mock, test } from 'node:test';

import { APP_LOGGER } from '../../../common/Consts';
import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
import { updateConfig } from '../updateConfig';

const flatConfig = {
    input: './test/spec/v3.json',
    output: './test/generated',
    httpClient: HttpClient.FETCH,
};

async function writeConfig(dir: string, content: unknown): Promise<string> {
    const configPath = join(dir, 'openapi.config.json');
    await writeFile(configPath, JSON.stringify(content, null, 2), 'utf8');
    return configPath;
}

describe('@unit: updateConfig', () => {
    test('returns failure when options fail schema validation', async () => {
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);
        const errorMock = mock.method(APP_LOGGER, 'error', () => undefined);

        const result = await updateConfig({ openapiConfig: 123 });

        assert.strictEqual(result.success, false);
        assert.ok(result.error);

        shutdownMock.mock.restore();
        errorMock.mock.restore();
    });

    test('returns failure when config file is missing', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'update-config-'));
        const configPath = join(dir, 'missing.json');
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);

        const result = await updateConfig({ openapiConfig: configPath });

        assert.strictEqual(result.success, false);
        assert.ok(result.error);

        shutdownMock.mock.restore();
    });

    test('logs up to date when config is current', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'update-config-'));
        const configPath = await writeConfig(dir, flatConfig);
        const infoMock = mock.method(APP_LOGGER, 'info', () => undefined);

        const result = await updateConfig({ openapiConfig: configPath });

        assert.strictEqual(result.success, true);
        assert.strictEqual(infoMock.mock.callCount(), 1);

        infoMock.mock.restore();
    });
});
