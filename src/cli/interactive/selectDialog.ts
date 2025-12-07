import { prompt } from 'enquirer';

import { APP_LOGGER } from '../../common/Consts';
import { DIALOG_MESSAGES } from './constants';
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
            choices: options.choices.map(choice => ({
                name: choice.name,
                value: choice.value,
                hint: choice.hint,
            })),
            initial: options.initial,
            result(value: any) {
                return value.value;
            },
        });

        return response.choice;
    } catch {
        APP_LOGGER.error(`\n${DIALOG_MESSAGES.SELECTION_CANCELLED}`);
        process.exit(0);
    }
}
