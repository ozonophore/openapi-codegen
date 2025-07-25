// logger.ts
import { TransformableInfo } from 'logform';
import { createLogger, format, Logger as WinstonLogger,transports } from 'winston';

export type LogLevel = 'error' | 'warn' | 'info';

export interface LoggerOptions {
  /** Идентификатор экземпляра (чтобы логи разных экземпляров не переплетались) */
  id: string;
  /** Начальный уровень логирования */
  level: LogLevel;
  /** Куда писать: 'console' или путь к файлу */
  destination: 'console' | string;
}

export class AppLogger {
  private logger: WinstonLogger;
  private forcedInfoTransport?: transports.ConsoleTransportInstance;

  constructor(private opts: LoggerOptions) {
    const { id, level, destination } = opts;

    // базовый формат: [timestamp] [id] level: message
    const logFormat = format.printf((info: TransformableInfo) => {
      return `${info.timestamp} [${id}] ${info.level}: ${info.message}`;
    });

    // создаём транспорты в зависимости от destination
    const chosenTransports = [];
    if (destination === 'console') {
      chosenTransports.push(new transports.Console());
    } else {
      chosenTransports.push(
        new transports.File({ filename: destination })
      );
    }

    // основной logger
    this.logger = createLogger({
      level,
      levels: {
        error: 0,
        warn: 1,
        info: 2,
      },
      format: format.combine(
        format.timestamp(),
        logFormat
      ),
      transports: chosenTransports,
    });

    // отдельный консольный транспорт для «форсированной» info-передачи
    this.forcedInfoTransport = new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        logFormat
      )
    });
  }

  /** Изменить уровень логирования «на ходу» */
  public setLevel(newLevel: LogLevel) {
    this.logger.level = newLevel;
  }

  /** Логирование ошибок */
  public error(message: string) {
    this.logger.error(message);
  }

  /** Логирование предупреждений */
  public warn(message: string) {
    this.logger.warn(message);
  }

  /** Обычная информационная запись */
  public info(message: string) {
    this.logger.info(message);
  }

  /**
   * Специальный метод: даже если текущий level = 'error',
   * отправит в консоль info-сообщение через отдельный транспорт.
   */
  public forceInfo(message: string) {
    if (this.forcedInfoTransport) {
      this.forcedInfoTransport.log({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
      } as TransformableInfo);
    }
  }
}
