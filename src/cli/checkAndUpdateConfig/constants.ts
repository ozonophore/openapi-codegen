import { EnquirerSelectChoice } from '../interactive/types';
import { EActionForConfigData } from './types';

export const ACTION_FOR_CONFIG_DATA_OPTIONS: EnquirerSelectChoice<EActionForConfigData>[] = [
    {
        name: 'Сформировать пример',
        value: EActionForConfigData.GET_EXAMPLE,
        hint: 'Будет сформирован пример файла конфигурации для дальнейшего запуска генерации',
    },
    {
        name: 'Перезаписать',
        value: EActionForConfigData.REWRITE,
        hint: 'Файл конфигурации будет обновлён до актуальной версии',
    },
    {
        name: 'Ничего не делать',
        value: EActionForConfigData.SKIP,
    },
];

export const ERROR_MESSAGES = {
    UPDATING_FAILED: 'Ошибка при обновлении данных конфигурационного файла',
    CHECKING_FAILED: 'Ошибка при проверке данных конфигурационного файла',
    FILE_NOT_FOUND: 'Отсутствует файл:',
} as const;

export const SUCCESS_MESSAGES = {
    CONFIG_VALID: (path: string) => `Параметры конфигурации в файле "${path}" прошли проверку`,
    CONFIG_UP_TO_DATE: (path: string) => `Данные в файле "${path}" актуальны`,
} as const;
