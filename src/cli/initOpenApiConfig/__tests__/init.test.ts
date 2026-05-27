import assert from 'node:assert';
import { describe, mock, test } from 'node:test';

import { APP_LOGGER } from '../../../common/Consts';
import { init } from '../init';

class ProcessExitError extends Error {
    constructor(public readonly exitCode: number) {
        super(`process.exit(${exitCode})`);
        this.name = 'ProcessExitError';
    }
}

describe('@unit: init', () => {
    test('exits when options fail schema validation', async () => {
        const exitMock = mock.method(process, 'exit', (code?: string | number | null | undefined) => {
            throw new ProcessExitError(Number(code ?? 0));
        });
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);
        const errorMock = mock.method(APP_LOGGER, 'error', () => undefined);

        await assert.rejects(() => init({ specsDir: 123 }), ProcessExitError);

        exitMock.mock.restore();
        shutdownMock.mock.restore();
        errorMock.mock.restore();
    });
});
