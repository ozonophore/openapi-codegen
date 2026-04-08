import chalk from 'chalk';
import { createLogger, format, Logger as WinstonLogger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { ELogLevel, ELogOutput } from './Enums';
import { LOGGER_ERROR_RECOMMENDATIONS, LOGGER_MESSAGES, TLoggerErrorCode } from './LoggerMessages';
import { joinHelper } from './utils/pathHelpers';

interface LoggerOptions {
    /** Instance ID (letters/numbers/hyphens/handwriting only) */
    instanceId: string;
    /** The initial logging level */
    level: ELogLevel;
    /** Where to write: 'console' or 'file' */
    logOutput: ELogOutput;
    /** Folder for logs (only with LogOutput='file') */
    /** Rotation parameters (only for LogOutput='file') */
    rotate?: {
        /** Template for the date in the file name */
        datePattern?: string; // for example: 'YYYY-MM-DD'
        /** The maximum file size, for example '20m' */
        maxSize?: string;
        /** Do not store files for longer, for example '14d' */
        maxFiles?: string;
    };
    /** Disable ANSI colors for console output (for CI / plain logs) */
    disableColors?: boolean;
}

interface ErrorWithHintOptions {
    code: TLoggerErrorCode;
    /** Краткое описание контекста или дополнительное сообщение для пользователя */
    message?: string;
    /** Оригинальная ошибка, если доступна (будет выведена на детальных уровнях логирования) */
    error?: unknown;
}

export class Logger {
    private _logger: WinstonLogger;
    private _currentLevel: ELogLevel;
    private _instanceId: string;
    private _disableColors: boolean;

    constructor(options: LoggerOptions) {
        const {
            instanceId,
            level,
            logOutput,
            rotate = { datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d' },
            disableColors = false,
        } = options;
        this._currentLevel = level;
        this._instanceId = instanceId;
        this._disableColors = disableColors;

        const baseLevelStyles: Record<
            ELogLevel | 'success',
            {
                icon: string;
                colorize: (text: string) => string;
            }
        > = {
            [ELogLevel.INFO]: {
                icon: 'ℹ',
                colorize: (text: string) => (this._disableColors ? text : chalk.gray(text)),
            },
            [ELogLevel.WARN]: {
                icon: '⚠',
                colorize: (text: string) => (this._disableColors ? text : chalk.hex('#F59E0B')(text)),
            },
            [ELogLevel.ERROR]: {
                icon: '✗',
                colorize: (text: string) => (this._disableColors ? text : chalk.red(text)),
            },
            success: {
                icon: '✓',
                colorize: (text: string) => (this._disableColors ? text : chalk.green(text)),
            },
        };

        const chosenTransports = [];
        if (logOutput === ELogOutput.CONSOLE) {
            chosenTransports.push(
                new transports.Console({
                    format: format.combine(
                        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        format.printf(({ level, message, timestamp, label }) => {
                            const style = baseLevelStyles[(level as ELogLevel) || ELogLevel.INFO] ?? baseLevelStyles.info;
                            const icon = style.icon;
                            const coloredMessage = style.colorize(String(message));
                            const timePart = this._disableColors ? timestamp : chalk.gray(timestamp);
                            const labelPart = this._disableColors ? label : chalk.bold(label);

                            return `${icon} [${labelPart}] ${timePart}: ${coloredMessage}`;
                        }),
                    ),
                })
            );
        } else {
            const logDir = joinHelper(process.cwd(), '__logs__');
            chosenTransports.push(
                new DailyRotateFile({
                    filename: joinHelper(logDir, 'app-%DATE%.log'),
                    datePattern: rotate.datePattern,
                    zippedArchive: true,
                    maxSize: rotate.maxSize,
                    maxFiles: rotate.maxFiles,
                    format: format.combine(
                        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        format.printf(({ level, message, timestamp, label }) => {
                            return `[${level}] [${label}] ${timestamp}: ${message}`;
                        }),
                    ),
                })
            );
        }

        this._logger = createLogger({
            level: this._currentLevel,
            levels: { error: 0, warn: 1, info: 2, success: 3 },
            format: format.label({ label: this._instanceId }),
            transports: chosenTransports,
        });
    }

    public setLevel(level: ELogLevel) {
        this._currentLevel = level;
        this._logger.level = level;
    }

    public error(message: string, error?: unknown): void {
        this._logger.error(`${LOGGER_MESSAGES.ERROR.PREFIX} ${message}`, error);
    }

    public errorWithHint(options: ErrorWithHintOptions): void {
        const { code, message, error } = options;

        const baseMessage = LOGGER_MESSAGES.ERROR.GENERIC(message ?? LOGGER_ERROR_RECOMMENDATIONS[code]);
        const recommendation = LOGGER_ERROR_RECOMMENDATIONS[code];

        this._logger.error(`${LOGGER_MESSAGES.ERROR.PREFIX} ${baseMessage}`);
        this._logger.info(LOGGER_MESSAGES.SEPARATOR);
        this._logger.info(`What you can do next: ${recommendation}`);

        if (this._currentLevel === ELogLevel.INFO && error) {
            this._logger.warn(`Technical details: ${String(error)}`);
        }
    }

    public warn(message: string) {
        this._logger.warn(message);
    }

    public info(message: string, hasSeparator?: boolean) {
        this._logger.info(message);
        if (hasSeparator) {
            this._logger.info(LOGGER_MESSAGES.SEPARATOR);
        }
    }

    public success(message: string) {
        this._logger.log('success', message);
    }

    public forceInfo(message: string) {
        const originalLevel = this._logger.level;
        this._logger.level = 'info';
        this._logger.info(message);
        this._logger.level = originalLevel;
    }

    public shutdownLogger(): void {
        if (this._logger) {
            this._logger.close();
            this._logger.transports.forEach(transport => {
                const t = transport as { close?: () => void; end?: () => void };
                if (typeof t.close === 'function') {
                    t.close();
                }
                if (typeof t.end === 'function') {
                    t.end();
                }
            });
        }
    }

    /**
     * Flushes and closes all transports (including file) so that all log messages
     * are written before the process exits. Use this before process.exit() when
     * logging to file to avoid losing the last messages.
     */
    public async shutdownLoggerAsync(): Promise<void> {
        if (!this._logger) {
            return;
        }
        const transportList = [...this._logger.transports];
        await Promise.all(
            transportList.map(
                (transport): Promise<void> =>
                    new Promise(resolve => {
                        const t = transport as { close?: (cb?: () => void) => void };
                        if (typeof t.close === 'function') {
                            t.close(resolve);
                        } else {
                            resolve();
                        }
                    })
            )
        );
        this._logger.close();
    }
}
