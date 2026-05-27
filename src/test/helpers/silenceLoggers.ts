import type { TestContext } from 'node:test';

import { APP_LOGGER } from '../../common/Consts';
import { Logger } from '../../common/Logger';

const noop = (): void => undefined;
const noopAsync = async (): Promise<void> => undefined;

/** Replaces APP_LOGGER public methods with no-ops. */
export function installSilenceAppLogger(): () => void {
    const warn = APP_LOGGER.warn.bind(APP_LOGGER);
    const info = APP_LOGGER.info.bind(APP_LOGGER);
    const error = APP_LOGGER.error.bind(APP_LOGGER);
    const errorWithHint = APP_LOGGER.errorWithHint.bind(APP_LOGGER);
    const success = APP_LOGGER.success.bind(APP_LOGGER);
    const forceInfo = APP_LOGGER.forceInfo.bind(APP_LOGGER);
    const shutdownLogger = APP_LOGGER.shutdownLogger.bind(APP_LOGGER);
    const shutdownLoggerAsync = APP_LOGGER.shutdownLoggerAsync.bind(APP_LOGGER);

    APP_LOGGER.warn = noop;
    APP_LOGGER.info = noop;
    APP_LOGGER.error = noop;
    APP_LOGGER.errorWithHint = noop;
    APP_LOGGER.success = noop;
    APP_LOGGER.forceInfo = noop;
    APP_LOGGER.shutdownLogger = noop;
    APP_LOGGER.shutdownLoggerAsync = noopAsync;

    return () => {
        APP_LOGGER.warn = warn;
        APP_LOGGER.info = info;
        APP_LOGGER.error = error;
        APP_LOGGER.errorWithHint = errorWithHint;
        APP_LOGGER.success = success;
        APP_LOGGER.forceInfo = forceInfo;
        APP_LOGGER.shutdownLogger = shutdownLogger;
        APP_LOGGER.shutdownLoggerAsync = shutdownLoggerAsync;
    };
}

/** Replaces Logger prototype public methods with no-ops (OpenApiClient `client` logger). */
export function installSilenceLoggerPrototype(): () => void {
    const warn = Logger.prototype.warn;
    const info = Logger.prototype.info;
    const error = Logger.prototype.error;
    const errorWithHint = Logger.prototype.errorWithHint;
    const success = Logger.prototype.success;
    const forceInfo = Logger.prototype.forceInfo;
    const shutdownLogger = Logger.prototype.shutdownLogger;
    const shutdownLoggerAsync = Logger.prototype.shutdownLoggerAsync;

    Logger.prototype.warn = noop;
    Logger.prototype.info = noop;
    Logger.prototype.error = noop;
    Logger.prototype.errorWithHint = noop;
    Logger.prototype.success = noop;
    Logger.prototype.forceInfo = noop;
    Logger.prototype.shutdownLogger = noop;
    Logger.prototype.shutdownLoggerAsync = noopAsync;

    return () => {
        Logger.prototype.warn = warn;
        Logger.prototype.info = info;
        Logger.prototype.error = error;
        Logger.prototype.errorWithHint = errorWithHint;
        Logger.prototype.success = success;
        Logger.prototype.forceInfo = forceInfo;
        Logger.prototype.shutdownLogger = shutdownLogger;
        Logger.prototype.shutdownLoggerAsync = shutdownLoggerAsync;
    };
}

/** Replaces APP_LOGGER and Logger public methods with no-ops. */
export function installSilenceLoggers(): () => void {
    const restoreAppLogger = installSilenceAppLogger();
    const restoreLoggerPrototype = installSilenceLoggerPrototype();

    return () => {
        restoreLoggerPrototype();
        restoreAppLogger();
    };
}

export function silenceAppLogger(t: TestContext): void {
    t.after(installSilenceAppLogger());
}

export function silenceLoggerPrototype(t: TestContext): void {
    t.after(installSilenceLoggerPrototype());
}

export function silenceLoggers(t: TestContext): void {
    t.after(installSilenceLoggers());
}
