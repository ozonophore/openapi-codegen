// logger.ts
import { existsSync, mkdirSync } from 'fs';
import { TransformableInfo } from 'logform';
import { createLogger, format, Logger as WinstonLogger,transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export type LogLevel = 'error' | 'warn' | 'info';
export type LogOutput = 'console' | 'file';

export interface LoggerOptions {
  /** Идентификатор экземпляра (только буквы/цифры/дефис/подчёрки) */
  id: string;
  /** Начальный уровень логирования */
  level: LogLevel;
  /** Куда писать: 'console' или 'file' */
  logOutput: LogOutput;
  /** Папка для логов (только при logOutput='file') */
  logDir?: string;
  /** Параметры ротации (только при logOutput='file') */
  rotate?: {
    /** Шаблон для даты в имени файла */
    datePattern?: string; // например 'YYYY-MM-DD'
    /** Максимальный размер файла, например '20m' */
    maxSize?: string;
    /** Хранить файлы не дольше, например '14d' */
    maxFiles?: string;
  };
}

export class AppLogger {
  private logger: WinstonLogger;
  private forcedInfoTransport: transports.ConsoleTransportInstance;

  constructor(private opts: LoggerOptions) {
    const {
      id,
      level,
      logOutput,
      logDir = './logs',
      rotate = { datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d' },
    } = opts;

    // форматирование: [timestamp] [id] level: message
    const logFormat = format.printf((info: TransformableInfo) =>
      `${info.timestamp} [${id}] ${info.level}: ${info.message}`
    );

    // транспорты
    const activeTransports = [];

    if (logOutput === 'file') {
      if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });

      // используем DailyRotateFile
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

    // создаём Winston Logger
    this.logger = createLogger({
      level,
      levels: { error: 0, warn: 1, info: 2 },
      format: format.combine(format.timestamp(), logFormat),
      transports: activeTransports,
    });

    // дополнительный консольный транспорт для forceInfo
    this.forcedInfoTransport = new transports.Console({
      level: 'info',
      format: format.combine(format.colorize(), format.timestamp(), logFormat),
    });
  }

  /** Сменить уровень уровня логирования */
  public setLevel(newLevel: LogLevel) {
    this.logger.level = newLevel;
    this.logger.transports.forEach(t => t.level = newLevel);
  }

  public error(msg: string) {
    this.logger.error(msg);
  }

  public warn(msg: string) {
    this.logger.warn(msg);
  }

  public info(msg: string) {
    this.logger.info(msg);
  }

  /** Всегда выводит info в консоль независимо от основного уровня */
  public forceInfo(msg: string) {
    this.forcedInfoTransport.log({
      level: 'info',
      message: msg,
      timestamp: new Date().toISOString(),
    } as TransformableInfo);
  }
}
