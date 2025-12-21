/**
 * Тип конфигурации для инициализации
 */
export enum EConfigType {
    NONE = 'NONE',
    FLAT = 'FLAT',
    MULTI = 'MULTI',
}

/**
 * Интерфейс для вариантов выбора в диалоге
 */
export interface EnquirerSelectChoice<T = string> {
    /** Текст, отображаемый пользователю */
    name: string;
    /** Возвращаемое значение при выборе */
    value: T;
    /** Подсказка/описание варианта */
    hint?: string;
}

/**
 * Опции для диалога подтверждения
 */
export interface EnquirerConfirmOptions {
    /** Вопрос для пользователя */
    message: string;
    /** Значение по умолчанию */
    initial?: boolean;
}

/**
 * Опции для диалога выбора
 */
export interface EnquirerSelectOptions<T = string> {
    /** Вопрос/сообщение */
    message: string;
    /** Варианты для выбора */
    choices: EnquirerSelectChoice<T>[];
    /** Индекс выбранного по умолчанию */
    initial?: number;
}