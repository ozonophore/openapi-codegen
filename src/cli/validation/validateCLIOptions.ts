import { ZodError, ZodSchema } from 'zod';

import { formatZodErrorForCLI } from './errorFormatter';

/**
 * Результат валидации
 */
export type ValidationResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Валидирует данные с помощью Zod схемы и возвращает отформатированный результат
 */
export function validateCLIOptions<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                error: formatZodErrorForCLI(error),
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown validation error',
        };
    }
}

/**
 * Валидирует данные с помощью Zod схемы и возвращает raw результат
 * (полезно когда нужен доступ к ZodError для дополнительной обработки)
 */
export function validateCLIOptionsRaw<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: ZodError } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return { success: false, error: result.error };
}
