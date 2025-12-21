import { EConfigType,EnquirerSelectChoice } from './types';

export const OPEN_API_CONFIG_SELECT_OPTIONS: EnquirerSelectChoice<EConfigType>[] = [
    {
        name: 'Набор опций',
        value: EConfigType.FLAT,
        hint: 'Набор параметров для генерации по одной спецификации.',
    },
    {
        name: 'Множественные опции',
        value: EConfigType.MULTI,
        hint: 'Набор параметров для генерации по нескольким файлам спецификаций.',
    },
    {
        name: 'Не генерировать',
        value: EConfigType.NONE,
        hint: 'Не создавать файл конфигурации',
    },
];

export const DIALOG_MESSAGES = {
    OPERATION_CANCELLED: 'Операция отменена пользователем.',
    SELECTION_CANCELLED: 'Выбор отменён.',
} as const;
