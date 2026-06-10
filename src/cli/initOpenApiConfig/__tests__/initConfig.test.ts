import assert from 'node:assert';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, mock, test, type TestContext } from 'node:test';

import { APP_LOGGER } from '../../../common/Consts';
import { silenceAppLogger } from '../../../test/helpers/silenceLoggers';
import { initConfig } from '../initConfig';
import { registerHandlebarTemplates } from '../utils/registerHandlebarTemplates';

describe('@unit: initConfig', () => {
    test('leaves existing config unchanged in non-interactive mode', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'init-config-'));
        const configPath = join(dir, 'openapi.config.json');
        await writeFile(configPath, '{"input":"./x.json","output":"./out"}', 'utf8');

        const warnMock = mock.method(APP_LOGGER, 'warn', () => undefined);
        const infoMock = mock.method(APP_LOGGER, 'info', () => undefined);
        const templates = registerHandlebarTemplates();

        await initConfig({
            openapiConfig: configPath,
            specsDir: dir,
            templates,
            useInteractiveMode: false,
        });

        assert.strictEqual(warnMock.mock.callCount(), 1);
        assert.strictEqual(infoMock.mock.callCount(), 1);

        warnMock.mock.restore();
        infoMock.mock.restore();
    });

    test('writes example config when no specs are found', async (t: TestContext) => {
        silenceAppLogger(t);

        const dir = await mkdtemp(join(tmpdir(), 'init-config-'));
        const configPath = join(dir, 'new-openapi.config.json');
        const templates = registerHandlebarTemplates();

        await initConfig({
            openapiConfig: configPath,
            specsDir: join(dir, 'empty-specs'),
            templates,
            useInteractiveMode: false,
        });

        const written = await readFile(configPath, 'utf8');
        assert.match(written, /"input"/);
        assert.match(written, /"output"/);
    });
});
