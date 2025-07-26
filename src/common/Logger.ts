import { createLogger, format, Logger as WinstonLogger,transports } from 'winston';

interface LoggerOptions {
    level: 'error' | 'warn' | 'info';
    transport: 'console' | 'file';
    filePath?: string;
}

export class AppLogger {
    private logger: WinstonLogger;
    private currentLevel: 'error' | 'warn' | 'info';

    constructor(options: LoggerOptions) {
        this.currentLevel = options.level;
        const transport = this.getTransport(options);
        this.logger = createLogger({
            level: this.currentLevel,
            format: format.combine(format.timestamp(), format.json()),
            transports: [transport],
        });
    }

    private getTransport(options: LoggerOptions) {
        if (options.transport === 'console') {
            return new transports.Console();
        } else if (options.transport === 'file') {
            if (!options.filePath) {
                throw new Error('File path is required for file transport');
            }
            return new transports.File({ filename: options.filePath });
        } else {
            throw new Error('Invalid transport type');
        }
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
        this.logger.log('info', message);
    }
}
