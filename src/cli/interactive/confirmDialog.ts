import { prompt } from 'enquirer';

import { APP_LOGGER } from '../../common/Consts';
import { DIALOG_MESSAGES } from './constants';
import { EnquirerConfirmOptions } from './types';

/**
 * Отображает диалог подтверждения для пользователя.
 * Используется для критичных действий (удаление, публикация и т.д.)
 *
 * @param options - Опции диалога
 * @returns Результат выбора пользователя (true/false)
 * @throws Процесс завершится при прерывании пользователем (Ctrl+C)
 *
 * @example
 * const confirmed = await confirmDialog({
 *   message: 'Вы уверены?',
 *   initial: false,
 * });
 */
export async function confirmDialog(options: EnquirerConfirmOptions): Promise<boolean> {
    try {
        const response = await prompt<{ answer: boolean }>({
            type: 'confirm',
            name: 'answer',
            message: options.message,
            initial: options.initial ?? true,
        });

        return response.answer;
    } catch {
        // Пользователь прервал процесс (Ctrl+C)
        APP_LOGGER.error(`\n${DIALOG_MESSAGES.OPERATION_CANCELLED}`);
        process.exit(0);
    }
}
