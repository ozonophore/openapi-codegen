import assert from 'node:assert';
import { describe, mock, test } from 'node:test';

import { APP_LOGGER } from '../../../common/Consts';
import { init } from '../init';

describe('@unit: init', () => {
    test('returns failure when options fail schema validation', async () => {
        const shutdownMock = mock.method(APP_LOGGER, 'shutdownLoggerAsync', async () => undefined);
        const errorMock = mock.method(APP_LOGGER, 'error', () => undefined);

        const result = await init({ specsDir: 123 });

        assert.strictEqual(result.success, false);
        assert.ok(result.error);

        shutdownMock.mock.restore();
        errorMock.mock.restore();
    });
});
