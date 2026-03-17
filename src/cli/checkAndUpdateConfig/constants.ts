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
