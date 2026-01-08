import { TFlatOptions } from '../cli/schemas/configSchemas';

// Реэкспортируем типы из Zod схем для единообразия
export type { TFlatOptions, TItemConfig, TRawOptions } from '../cli/schemas/configSchemas';

// Реэкспортируем схемы для использования в валидации
export { baseFlatOptionsSchema, flatOptionsSchema, itemConfigSchema, rawOptionsSchema } from '../cli/schemas/configSchemas';

export type TStrictFlatOptions = {
    [P in keyof TFlatOptions]-?: NonNullable<TFlatOptions[P]>;
};
