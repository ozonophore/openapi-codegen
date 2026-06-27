import assert from 'node:assert';
import { afterEach, beforeEach, describe, mock, test } from 'node:test';

import { SelfHealingClient } from '../../../core/monitoring/SelfHealingClient';
import { OpenApiClient } from '../../../core/OpenApiClient';
import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { heal } from '../heal';

describe('@unit: heal', () => {
    let restoreLoggers: (() => void) | undefined;
    let runOnceMock: ReturnType<typeof mock.method>;
    let generateMock: ReturnType<typeof mock.method>;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
        runOnceMock = mock.method(SelfHealingClient.prototype, 'runOnce', async () => []);
        generateMock = mock.method(OpenApiClient.prototype, 'generate', async () => undefined);
    });

    afterEach(() => {
        runOnceMock.mock.restore();
        generateMock.mock.restore();
        restoreLoggers?.();
    });

    test('does not regenerate client when no specWritten event occurred', async () => {
        runOnceMock.mock.mockImplementation(async () => [
            {
                timestamp: new Date().toISOString(),
                type: 'spec-change-detected',
                status: 'pending',
                details: 'Detected 1 change(s): 1 addition',
            },
            {
                timestamp: new Date().toISOString(),
                type: 'auto-applied',
                status: 'success',
                details: 'No applicable changes to apply',
            },
        ]);

        await heal({
            specUrl: 'https://api.example.com/openapi.json',
            localSpec: './spec.json',
            output: './src/api',
            once: true,
        });

        assert.equal(generateMock.mock.callCount(), 0);
    });

    test('regenerates client only when auto-applied event has specWritten', async () => {
        runOnceMock.mock.mockImplementation(async () => [
            {
                timestamp: new Date().toISOString(),
                type: 'spec-change-detected',
                status: 'pending',
                details: 'Detected 1 change(s): 1 addition',
            },
            {
                timestamp: new Date().toISOString(),
                type: 'auto-applied',
                status: 'success',
                specWritten: true,
                details: 'Successfully applied 1 change(s): New endpoint added: /pets',
            },
        ]);

        await heal({
            specUrl: 'https://api.example.com/openapi.json',
            localSpec: './spec.json',
            output: './src/api',
            once: true,
        });

        assert.equal(generateMock.mock.callCount(), 1);
        assert.deepEqual(generateMock.mock.calls[0]?.arguments[0], {
            input: './spec.json',
            output: './src/api',
            httpClient: HttpClient.FETCH,
        } as Parameters<OpenApiClient['generate']>[0]);
    });
});
