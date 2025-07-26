import * as path from 'path';
import { createLogger, format, Logger as WinstonLogger,transports } from 'winston';
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
    });

    this.logger = createLogger({
      level: this.currentLevel,
      format: format.combine(
        format.timestamp(),
        format.label({ label: this.instanceId }),
        format.json()
      ),
      transports: [
        fileTransport,
        new transports.Console(), // Добавляем консольный вывод
      ],
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
    this.logger.log('info', message);
  }
}
