import * as path from 'path';
import { createLogger, format, Logger as WinstonLogger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

interface LoggerOptions {
    level: 'error' | 'warn' | 'info';
    instanceId: string;
}

export class AppLogger {
    private logger: WinstonLogger;
    private currentLevel: 'error' | 'warn' | 'info';
    private instanceId: string;

    constructor(options: LoggerOptions) {
        this.currentLevel = options.level;
        this.instanceId = options.instanceId;

        const logDir = path.join(process.cwd(), '__logs__');
        const fileTransport = new DailyRotateFile({
            filename: path.join(logDir, 'app-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
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
            format: format.label({ label: this.instanceId }),
            transports: [fileTransport, consoleTransport],
        });
    }

    public setLevel(level: 'error' | 'warn' | 'info') {
        this.currentLevel = level;
        this.logger.level = level;
    }

    public error(message: string) {
        this.logger.error(message);
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
