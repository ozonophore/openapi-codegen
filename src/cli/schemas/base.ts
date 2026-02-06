import { z } from 'zod';

import { ELogLevel, ELogOutput } from '../../common/Enums';
import { HttpClient } from '../../core/types/enums/HttpClient.enum';

/**
 * Преобразует пустые строки в undefined для опциональных полей
 * Это нужно, потому что Commander.js передает пустые строки для опций без значений
 */
export const emptyStringToUndefined = z.preprocess(val => (val === '' ? undefined : val), z.string().min(1).optional());

/**
 * Базовая схема с общими опциями для всех команд
 */
export const baseCLIOptionsSchema = z.object({
    openapiConfig: emptyStringToUndefined,
});

export type BaseCLIOptions = z.infer<typeof baseCLIOptionsSchema>;

/**
 * Enum схемы для типизированных значений
 */
export const httpClientSchema = z.enum(HttpClient);
export const logLevelSchema = z.enum(ELogLevel);
export const logTargetSchema = z.enum(ELogOutput);
