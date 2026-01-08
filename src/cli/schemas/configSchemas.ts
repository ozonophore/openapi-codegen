import { z } from 'zod';

import { httpClientSchema, logLevelSchema, logTargetSchema } from '../../cli/schemas/base';

/**
 * Схема для отдельного элемента конфигурации (используется в массиве items)
 */
export const itemConfigSchema = z.object({
    input: z.string().min(1, 'Input is required'),
    output: z.string().min(1, 'Output is required'),
    outputCore: z.string().min(1).optional(),
    outputServices: z.string().min(1).optional(),
    outputModels: z.string().min(1).optional(),
    outputSchemas: z.string().min(1).optional(),
    request: z.string().min(1).optional(),
    httpClient: httpClientSchema.optional(),
});

export type TItemConfig = z.infer<typeof itemConfigSchema>;

/**
 * Схема для output директорий (используется как в items, так и в корне)
 */
export const outputPathsSchema = z.object({
    outputCore: z.string().min(1).optional(),
    outputServices: z.string().min(1).optional(),
    outputModels: z.string().min(1).optional(),
    outputSchemas: z.string().min(1).optional(),
});

/**
 * Схема для префиксов
 */
export const prefixesSchema = z.object({
    interfacePrefix: z.string().min(1).optional().default('I'),
    enumPrefix: z.string().min(1).optional().default('E'),
    typePrefix: z.string().min(1).optional().default('T'),
});

/**
 * Базовая схема для общих опций (без items/input/output)
 */
export const commonOptionsSchema = z.object({
    httpClient: httpClientSchema.optional(),
    useOptions: z.boolean().optional().default(false),
    useUnionTypes: z.boolean().optional().default(false),
    excludeCoreServiceFiles: z.boolean().optional().default(false),
    includeSchemasFiles: z.boolean().optional().default(false),
    request: z.string().min(1).optional(),
    useCancelableRequest: z.boolean().optional().default(false),
    logLevel: logLevelSchema.optional(),
    logTarget: logTargetSchema.optional(),
    sortByRequired: z.boolean().optional().default(false),
    useSeparatedIndexes: z.boolean().optional().default(false),
});

/**
 * Базовая схема опций без обязательных input/output
 * Используется как основа для CLI команд и конфиг-файлов
 */
export const baseFlatOptionsSchema = outputPathsSchema.merge(prefixesSchema).merge(commonOptionsSchema);

/**
 * Полная схема для конфиг-файла (TRawOptions)
 * Поддерживает два формата:
 * 1. С массивом items (multi-options)
 * 2. С input/output в корне (single-options)
 */
export const rawOptionsSchema = z
    .object({
        // Multi-item configuration
        items: z.array(itemConfigSchema).min(1, 'Items array must contain at least one item').optional(),

        // Single-item configuration (взаимоисключающие с items)
        input: z.string().min(1).optional(),
        output: z.string().min(1).optional(),
    })
    .merge(baseFlatOptionsSchema)
    .superRefine((data, ctx) => {
        // Проверка: либо items, либо input+output должны быть указаны
        const hasItems = data.items && data.items.length > 0;
        const hasInputOutput = !!(data.input && data.output);

        if (!hasItems && !hasInputOutput) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Either "items" array or "input" + "output" must be provided',
                path: [],
            });
        }

        // Если есть items, то input и output в корне не должны быть указаны
        if (hasItems && hasInputOutput) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Cannot use both "items" array and "input"/"output" at the root level',
                path: ['items'],
            });
        }

        // Валидация: если excludeCoreServiceFiles === true, request не должен быть указан
        if (data.excludeCoreServiceFiles === true && data.request) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '"request" can only be used when "excludeCoreServiceFiles" is false',
                path: ['request'],
            });
        }

        // Валидация для каждого элемента в items
        if (hasItems && data.items) {
            data.items.forEach((item, index) => {
                if (item.request && data.excludeCoreServiceFiles === true) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: '"request" in items can only be used when "excludeCoreServiceFiles" is false',
                        path: ['items', index, 'request'],
                    });
                }
            });
        }
    });

export type TRawOptions = z.infer<typeof rawOptionsSchema>;

/**
 * Схема для плоских опций (без items) - TFlatOptions
 * Используется для конфиг-файлов с одной спецификацией
 */
export const flatOptionsSchema = baseFlatOptionsSchema
    .extend({
        input: z.string().min(1, 'Input is required'),
        output: z.string().min(1, 'Output is required'),
    })
    .superRefine((data, ctx) => {
        // Валидация: если excludeCoreServiceFiles === true, request не должен быть указан
        if (data.excludeCoreServiceFiles === true && data.request) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '"request" can only be used when "excludeCoreServiceFiles" is false',
                path: ['request'],
            });
        }
    });

export type TFlatOptions = z.infer<typeof flatOptionsSchema>;