import { z } from 'zod';

import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../../common/Consts';
import { ELogLevel, ELogOutput } from '../../common/Enums';
import { HttpClient } from '../../core/types/enums/HttpClient.enum';

/**
 * Базовая схема с общими опциями для всех команд
 */
export const baseCLIOptionsSchema = z.object({
    openapiConfig: z.string().optional().default(DEFAULT_OPENAPI_CONFIG_FILENAME),
});

export type BaseCLIOptions = z.infer<typeof baseCLIOptionsSchema>;

/**
 * Enum схемы для типизированных значений
 */
export const httpClientSchema = z.nativeEnum(HttpClient);
export const logLevelSchema = z.nativeEnum(ELogLevel);
export const logTargetSchema = z.nativeEnum(ELogOutput);
