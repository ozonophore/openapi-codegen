/**
 * Действия, доступные при работе с конфигурацией
 */
export enum EActionForConfigData {
    REWRITE = 'REWRITE',
    GET_EXAMPLE = 'GET_EXAMPLE',
    SKIP = 'SKIP',
}

/**
 * Результат валидации конфигурации
 */
export interface IConfigValidationResult {
    /** Является ли версия конфигурации актуальной */
    isActualConfigVersion: boolean;
    /** Содержит ли конфигурация значения по умолчанию */
    hasDefaultValues: boolean;
    /** Мигрированные данные конфигурации */
    migratedData: Record<string, any>;
}
