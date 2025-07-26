// logger.ts
import { existsSync, mkdirSync } from 'fs';
import { TransformableInfo } from 'logform';
import { createLogger, format, Logger as WinstonLogger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export type LogLevel = 'error' | 'warn' | 'info';
export type LogOutput = 'console' | 'file';

export interface LoggerOptions {
    /** Instance ID (letters/numbers/hyphens/handwriting only) */
    id: string;
    /** The initial logging level */
    level: LogLevel;
    /** Where to write: 'console' or 'file' */
    logOutput: LogOutput;
    /** Folder for logs (only with LogOutput='file') */
    logDir?: string;
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

export class AppLogger {
    private logger: WinstonLogger;
    private forcedInfoTransport: transports.ConsoleTransportInstance;

    constructor(private opts: LoggerOptions) {
        const { id, level, logOutput, logDir = './logs', rotate = { datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d' } } = opts;

        const logFormat = format.printf((info: TransformableInfo) => `${info.timestamp} [${id}] ${info.level}: ${info.message}`);

        const activeTransports = [];

        if (logOutput === 'file') {
            if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
            activeTransports.push(
                new DailyRotateFile({
                    dirname: logDir,
                    filename: `${id}-%DATE%.log`,
                    datePattern: rotate.datePattern,
                    maxSize: rotate.maxSize,
                    maxFiles: rotate.maxFiles,
                    level,
                })
            );
        } else {
            activeTransports.push(new transports.Console({ level }));
        }

        this.logger = createLogger({
            level,
            levels: { error: 0, warn: 1, info: 2 },
            format: format.combine(format.timestamp(), logFormat),
            transports: activeTransports,
        });

        // Initializing the console transport for forceInfo only
        this.forcedInfoTransport = new transports.Console({
            level: 'info',
            format: format.combine(format.colorize(), format.timestamp(), logFormat),
        });
    }

    public setLevel(newLevel: LogLevel) {
        this.logger.level = newLevel;
        this.logger.transports.forEach(t => (t.level = newLevel));
    }

    public error(msg: string) {
        this.logger.error(msg);
        process.exit(1);
    }

    public warn(msg: string) {
        this.logger.warn(msg);
    }

    public info(msg: string, hasSeparator?: boolean) {
        this.logger.info(msg);
        if (hasSeparator) {
            this.logger.info('==================================');
        }
    }

    /** Outputs info to the console regardless of the main level */
    public forceInfo(msg: string) {
        if (this.forcedInfoTransport) {
            this.forcedInfoTransport.log?.({
                level: 'info',
                message: msg,
                timestamp: new Date().toISOString(),
            } as TransformableInfo, () => {});
        }
    }
}
