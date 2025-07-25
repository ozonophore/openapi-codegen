// logger.ts
import { existsSync, mkdirSync } from 'fs';
import { TransformableInfo } from 'logform';
import { createLogger, format, Logger as WinstonLogger,transports } from 'winston';

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
}

export class AppLogger {
  private logger: WinstonLogger;
  private forcedInfoTransport: transports.ConsoleTransportInstance;

  constructor(private opts: LoggerOptions) {
    const { id, level, logOutput, logDir = './logs' } = opts;

    // готовим формат: [timestamp] [id] level: message
    const logFormat = format.printf((info: TransformableInfo) => {
      return `${info.timestamp} [${id}] ${info.level}: ${info.message}`;
    });

    // собираем транспорты в массив
    const activeTransports = [];

    if (logOutput === 'file') {
      // создаём папку, если нужно
      if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });

      // формируем имя файла: <id>_<YYYYMMDD-HHmmss>.log
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `${logDir}/${id}_${ts}.log`;

      activeTransports.push(new transports.File({ filename }));
    } else {
      activeTransports.push(new transports.Console());
    }

    // базовый Winston-логгер
    this.logger = createLogger({
      level,
      levels: { error: 0, warn: 1, info: 2 },
      format: format.combine(format.timestamp(), logFormat),
      transports: activeTransports,
    });

    // отдельный транспорт для принудительного info в консоль
    this.forcedInfoTransport = new transports.Console({
      level: 'info',
      format: format.combine(format.colorize(), format.timestamp(), logFormat),
    });
  }

  /** Сменить уровень "на лету" */
  public setLevel(newLevel: LogLevel) {
    this.logger.level = newLevel;
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

  /** Всегда выводит info в консоль, независимо от основного уровня */
  public forceInfo(msg: string) {
    this.forcedInfoTransport.log({ level: 'info', message: msg, timestamp: new Date().toISOString() } as TransformableInfo);
  }
}
