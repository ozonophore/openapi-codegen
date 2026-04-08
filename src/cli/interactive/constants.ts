import { EConfigType,EnquirerSelectChoice } from './types';

export const OPEN_API_CONFIG_SELECT_OPTIONS: EnquirerSelectChoice<EConfigType>[] = [
    {
        name: 'Single options',
        value: EConfigType.FLAT,
        hint: 'A set of parameters to generate according to a single specification.',
    },
    {
        name: 'Multiple options',
        value: EConfigType.MULTI,
        hint: 'A set of parameters for generating multiple specification files.',
    },
    {
        name: 'Do not generate',
        value: EConfigType.NONE,
        hint: 'Do not create a configuration file',
    },
];

export const DIALOG_MESSAGES = {
    OPERATION_CANCELLED: 'The operation was canceled by the user.',
    SELECTION_CANCELLED: 'The choice is canceled.',
} as const;
