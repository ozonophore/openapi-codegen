import assert from 'node:assert';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, mock, test } from 'node:test';

import { APP_LOGGER } from '../../../common/Consts';
import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
import { checkConfig } from '../checkConfig';

/** Config without schema-default fields so checkConfig does not open enquirer. */
const flatConfig = {
    input: './test/spec/v3.json',
    output: './test/generated',
    httpClient: HttpClient.AXIOS,
};

async function writeConfig(dir: string, content: unknown): Promise<string> {
    const configPath = join(dir, 'openapi.config.json');
    await writeFile(configPath, JSON.stringify(content, null, 2), 'utf8');
    return configPath;
}

describe('@unit: checkConfig', () => {
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

    test('reports valid config without prompting when up to date', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'check-config-'));
        const configPath = await writeConfig(dir, flatConfig);
        const infoMock = mock.method(APP_LOGGER, 'info', () => undefined);

        const result = await checkConfig({ openapiConfig: configPath });

        assert.strictEqual(result.success, true);
        assert.strictEqual(infoMock.mock.callCount(), 1);

        infoMock.mock.restore();
    });
});
