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
    private logger: WinstonLogger;
    private currentLevel: ELogLevel;
    private instanceId: string;

    constructor(options: LoggerOptions) {
        const {instanceId, level, rotate = { datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d' } } = options;
        this.currentLevel = level;
        this.instanceId = instanceId;

        // const logFormat = format.printf((info: TransformableInfo) => `${info.timestamp} [${id}] ${info.level}: ${info.message}`);

        const logDir = path.join(process.cwd(), '__logs__');
        const fileTransport = new DailyRotateFile({
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
        });

        const consoleTransport = new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.printf(({ level, message, timestamp, label }) => {
                    return `[${level}] [${label}] ${timestamp}: ${message}`;
                })
            ),
        });

        this.logger = createLogger({
            level: this.currentLevel,
            levels: { error: 0, warn: 1, info: 2 },
            format: format.label({ label: this.instanceId }),
            transports: [fileTransport, consoleTransport],
        });
    }

    public setLevel(level: ELogLevel) {
        this.currentLevel = level;
        this.logger.level = level;
    }

    public error(message: string) {
        this.logger.error(`Error: ${message}`);
         process.exit(1);
    }

    public warn(message: string) {
        this.logger.warn(message);
    }

    public info(message: string, hasSeparator?: boolean) {
        this.logger.info(message);
        if (hasSeparator) {
            this.logger.info('==========================================');
        }
    }

    public forceInfo(message: string) {
        const originalLevel = this.logger.level;
        this.logger.level = 'info';
        this.logger.info(message);
        this.logger.level = originalLevel;
    }
}
