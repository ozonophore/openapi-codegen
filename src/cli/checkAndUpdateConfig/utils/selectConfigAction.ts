import { APP_LOGGER } from '../../../common/Consts';
import { selectDialog } from '../../interactive/selectDialog';
import { EnquirerSelectChoice } from '../../interactive/types';
import { EActionForConfigData } from '../types';
import { generateConfigExample } from './generateConfigExample';
import { rewriteConfigFile } from './rewriteConfigFile';

interface ISelectConfigActionOptions {
    /** Мигрированные данные конфигурации */
    migratedData: Record<string, any>;
    /** Путь к файлу конфигурации */
    configPath: string;
    /** Предупреждающее сообщение для пользователя */
    warningMessage: string;
    /** Варианты действий */
    actionChoices: EnquirerSelectChoice<EActionForConfigData>[];
}

/**
 * Запрашивает у пользователя действие для работы с конфигурацией.
 * Поддерживает три основных действия: создание примера, перезапись или пропуск.
 *
 * @param options - Опции диалога выбора действия
 *
 * @example
 * await selectConfigAction({
 *   migratedData: result.migratedData,
 *   configPath: './openapi-config.json',
 *   warningMessage: 'Configuration version is outdated',
 *   actionChoices: ACTION_FOR_CONFIG_DATA_OPTIONS,
 * });
 */
export async function selectConfigAction(options: ISelectConfigActionOptions): Promise<void> {
    APP_LOGGER.warn(`\n${options.warningMessage}\n`);

    const selectedAction = await selectDialog<EActionForConfigData>({
        message: 'Choose an action:',
        choices: options.actionChoices,
    });

    await handleConfigAction(selectedAction, options);
}

/**
 * Обрабатывает выбранное пользователем действие
 * @internal
 */
async function handleConfigAction(
    action: EActionForConfigData,
    options: ISelectConfigActionOptions
): Promise<void> {
    switch (action) {
        case EActionForConfigData.GET_EXAMPLE:
            await generateConfigExample(options.migratedData, options.configPath);
            break;

        case EActionForConfigData.REWRITE:
            await rewriteConfigFile(options.migratedData, options.configPath);
            break;

        case EActionForConfigData.SKIP:
            APP_LOGGER.info('Action skipped.');
            break;

        default:
            APP_LOGGER.error(`Unknown action: ${action}`);
    }
}
