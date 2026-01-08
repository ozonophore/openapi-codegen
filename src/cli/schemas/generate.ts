import { z } from 'zod';

import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../../common/Consts';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { baseCLIOptionsSchema } from './base';
import { baseFlatOptionsSchema } from './configSchemas';

/**
 * Схема для команды generate
 * Основана на baseFlatOptionsSchema, но с добавлением:
 * - openapiConfig (из baseCLIOptionsSchema)
 * - опциональными input/output (валидируются условно)
 */
export const generateOptionsSchema = baseCLIOptionsSchema
    .merge(baseFlatOptionsSchema)
    .extend({
        input: z.string().min(1).optional(),
        output: z.string().min(1).optional(),
    })
    .superRefine((data, ctx) => {
        // Проверка: если excludeCoreServiceFiles === true, request не должен быть указан
        if (data.excludeCoreServiceFiles === true && data.request) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '"--request" can only be used when "excludeCoreServiceFiles" is false',
                path: ['request'],
            });
        }

        // Проверка: input и output обязательны, если конфиг-файл не существует или пуст
        const configPath = data.openapiConfig || DEFAULT_OPENAPI_CONFIG_FILENAME;
        const configData = loadConfigIfExists(configPath);

        // Если конфиг не существует или пуст, требуем input и output
        const needsInputOutput = !configData || (Array.isArray(configData) && configData.length === 0) || (typeof configData === 'object' && Object.keys(configData).length === 0);

        if (needsInputOutput) {
            if (!data.input || data.input.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: '"--input" is required when no valid config file is provided',
                    path: ['input'],
                });
            }

            if (!data.output || data.output.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: '"--output" is required when no valid config file is provided',
                    path: ['output'],
                });
            }
        }
    });

export type GenerateOptions = z.infer<typeof generateOptionsSchema>;
