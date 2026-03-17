import { prompt } from 'enquirer';

import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { EnquirerSelectOptions } from './types';

/**
 * Отображает диалог выбора одного варианта из списка.
 *
 * @param options - Опции диалога выбора
 * @returns Выбранное значение (тип из choices.value)
 * @throws Процесс завершится при прерывании пользователем (Ctrl+C)
 *
 * @example
 * const selected = await selectDialog<MyEnum>({
 *   message: 'Выберите вариант',
 *   initial: 0,
 *   choices: myChoices,
 * });
 */
export async function selectDialog<T = string>(options: EnquirerSelectOptions<T>): Promise<T> {
    try {
        const response = await prompt<{ choice: T }>({
            type: 'select',
            name: 'choice',
            message: options.message,
            choices: options.choices.map((choice, index) => ({
                // Enquirer возвращает `name` выбранного пункта.
                // Храним в `name` технический id, а в `message` - текст для пользователя.
                name: String(index),
                message: choice.name,
                value: choice.value,
                hint: choice.hint,
            })),
            initial: options.initial,
            result(this: any, selectedName: string) {
                const selectedChoice = this.choices.find((choice: { name: string; value: T }) => choice.name === selectedName);
                return selectedChoice?.value;
            },
        });

        return response.choice;
    } catch {
        APP_LOGGER.error(LOGGER_MESSAGES.DIALOG.SELECTION_CANCELLED);
        await APP_LOGGER.shutdownLoggerAsync();
        process.exit(0);
    }
}
