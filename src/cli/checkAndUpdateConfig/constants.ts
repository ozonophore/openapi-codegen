import { EnquirerSelectChoice } from '../interactive/types';
import { EActionForConfigData } from './types';

export const ACTION_FOR_CONFIG_DATA_OPTIONS: EnquirerSelectChoice<EActionForConfigData>[] = [
    {
        name: 'Generate example',
        value: EActionForConfigData.GET_EXAMPLE,
        hint: 'An example configuration file will be generated for subsequent generation runs',
    },
    {
        name: 'Overwrite',
        value: EActionForConfigData.REWRITE,
        hint: 'The configuration file will be updated to the current version',
    },
    {
        name: 'Do nothing',
        value: EActionForConfigData.SKIP,
    },
];
