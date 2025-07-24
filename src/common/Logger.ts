import * as path from 'path';
import { createLogger, format, Logger as WinstonLogger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { ELogLevel, ELogOutput } from './Enums';

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
}

export class Logger {
    private _logger: WinstonLogger;
    private _currentLevel: ELogLevel;
    private _instanceId: string;

    constructor(options: LoggerOptions) {
        const { instanceId, level, logOutput, rotate = { datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d' } } = options;
        this._currentLevel = level;
        this._instanceId = instanceId;

        const chosenTransports = [];
        if (logOutput === ELogOutput.CONSOLE) {
            chosenTransports.push(
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        format.printf(({ level, message, timestamp, label }) => {
                            return `[${level}] [${label}] ${timestamp}: ${message}`;
                        })
                    ),
                })
            );
        } else {
            const logDir = path.join(process.cwd(), '__logs__');
            chosenTransports.push(
                new DailyRotateFile({
                    filename: path.join(logDir, 'app-%DATE%.log'),
                    datePattern: rotate.datePattern,
                    zippedArchive: true,
                    maxSize: rotate.maxSize,
                    maxFiles: rotate.maxFiles,
                    format: format.combine(
                        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        format.printf(({ level, message, timestamp, label }) => {
                            return `[${level}] [${label}] ${timestamp}: ${message}`;
                        })
                    ),
                })
            );
        }

        this._logger = createLogger({
            level: this._currentLevel,
            levels: { error: 0, warn: 1, info: 2 },
            format: format.label({ label: this._instanceId }),
            transports: chosenTransports,
        });
    }

    public setLevel(level: ELogLevel) {
        this._currentLevel = level;
        this._logger.level = level;
    }

    public error(message: string) {
        this._logger.error(`Error: ${message}`);
        process.exit(1);
    }

    public warn(message: string) {
        this._logger.warn(message);
    }

    public info(message: string, hasSeparator?: boolean) {
        this._logger.info(message);
        if (hasSeparator) {
            this._logger.info('==========================================');
        }
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
                if (typeof (transport as any).close === 'function') {
                    (transport as any).close();
                }
                if (typeof (transport as any).end === 'function') {
                    (transport as any).end();
                }
            });
        }
    }
}
