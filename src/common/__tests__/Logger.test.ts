import assert from 'node:assert';
import { describe, mock, test } from 'node:test';

import { ELogLevel, ELogOutput } from '../Enums';
import { Logger } from '../Logger';
import { LOGGER_ERROR_CODES, LOGGER_ERROR_RECOMMENDATIONS } from '../LoggerMessages';

describe('@unit: Logger', () => {
    test('errorWithHint should log error with recommendation for known code', () => {
        const logger = new Logger({
            instanceId: 'test',
            level: ELogLevel.ERROR,
            logOutput: ELogOutput.CONSOLE,
            disableColors: true,
        });

        const loggerErrorMock = mock.fn();
        const loggerInfoMock = mock.fn();
        const loggerWarnMock = mock.fn();

        (logger as any)._logger = {
            error: loggerErrorMock,
            info: loggerInfoMock,
            warn: loggerWarnMock,
            level: 'error',
            log: mock.fn(),
        };

        const code = LOGGER_ERROR_CODES.CONFIG_FILE_MISSING;
        const recommendation = LOGGER_ERROR_RECOMMENDATIONS[code];

        const exitMock = mock.method(process, 'exit', () => {
            // nothing
        });

        logger.errorWithHint({ code });

        assert.strictEqual(loggerErrorMock.mock.callCount(), 1);
        assert.ok(
            String(loggerErrorMock.mock.calls[0].arguments[0]).includes('Error:'),
            'error message should contain "Error:" prefix',
        );

        assert.ok(loggerInfoMock.mock.callCount() >= 2);
        const infoMessages = loggerInfoMock.mock.calls.map(call => String(call.arguments[0]));

        assert.ok(
            infoMessages.some(msg => msg.includes('What you can do next')),
            'info should contain recommendation title',
        );
        assert.ok(
            infoMessages.some(msg => msg.includes(recommendation)),
            'info should contain concrete recommendation text',
        );

        // Logger no longer calls process.exit; caller is responsible for flush and exit
        assert.strictEqual(exitMock.mock.callCount(), 0);
    });

    test('success should delegate to internal logger with success level', () => {
        const logger = new Logger({
            instanceId: 'test',
            level: ELogLevel.INFO,
            logOutput: ELogOutput.CONSOLE,
            disableColors: true,
        });

        const logMock = mock.fn();

        (logger as any)._logger = {
            log: logMock,
            level: 'info',
        };

        logger.success('Done');

        assert.strictEqual(logMock.mock.callCount(), 1);
        const [level, message] = logMock.mock.calls[0].arguments as [string, string];
        assert.strictEqual(level, 'success');
        assert.strictEqual(message, 'Done');
    });

    test('error should not call process.exit', () => {
        const logger = new Logger({
            instanceId: 'test',
            level: ELogLevel.ERROR,
            logOutput: ELogOutput.CONSOLE,
            disableColors: true,
        });

        const loggerErrorMock = mock.fn();
        (logger as any)._logger = { error: loggerErrorMock, level: 'error' };

        const exitMock = mock.method(process, 'exit', () => {
            throw new Error('process.exit should not be called by Logger.error');
        });

        logger.error('Something failed');

        assert.strictEqual(loggerErrorMock.mock.callCount(), 1);
        assert.strictEqual(exitMock.mock.callCount(), 0);
    });

    test('shutdownLoggerAsync should resolve and close transports', async () => {
        const logger = new Logger({
            instanceId: 'test',
            level: ELogLevel.INFO,
            logOutput: ELogOutput.CONSOLE,
            disableColors: true,
        });

        let closeCalled = false;
        const mockTransport = {
            close(cb?: () => void) {
                closeCalled = true;
                if (typeof cb === 'function') cb();
            },
        };
        (logger as any)._logger = {
            transports: [mockTransport],
            close: mock.fn(),
        };

        await logger.shutdownLoggerAsync();

        assert.strictEqual(closeCalled, true);
    });
});

