/**
 * Константы с текстовыми сообщениями для Logger
 * Все тексты для логирования должны быть вынесены сюда для централизованного управления
 */
export const LOGGER_ERROR_CODES = {
    CONFIG_FILE_MISSING: 'CONFIG_FILE_MISSING',
    CONFIG_FILE_NOT_FOUND_AT: 'CONFIG_FILE_NOT_FOUND_AT',
    NO_OPTIONS_PROVIDED: 'NO_OPTIONS_PROVIDED',
    NO_SPEC_FILES_FOUND: 'NO_SPEC_FILES_FOUND',
    NO_VALID_SPEC_FILES_FOUND: 'NO_VALID_SPEC_FILES_FOUND',
    PREVIEW_DIR_EMPTY: 'PREVIEW_DIR_EMPTY',
    PREVIEW_CLEANUP_FAILED: 'PREVIEW_CLEANUP_FAILED',
    SPEC_FILES_FIND_ERROR: 'SPEC_FILES_FIND_ERROR',
} as const;

export type TLoggerErrorCode = keyof typeof LOGGER_ERROR_CODES;

/**
 * Человекочитаемые рекомендации для пользователя CLI по коду ошибки
 */
export const LOGGER_ERROR_RECOMMENDATIONS: Record<TLoggerErrorCode, string> = {
    CONFIG_FILE_MISSING:
        'Создайте конфигурационный файл (по умолчанию openapi.config.json) или укажите путь к нему через опцию --openapi-config. В качестве альтернативы можно передать обязательные параметры --input и --output напрямую в команду.',
    CONFIG_FILE_NOT_FOUND_AT:
        'Проверьте правильность пути к конфигурационному файлу (--openapi-config) и наличие файла на диске. Обновите путь или создайте файл с нужными параметрами.',
    NO_OPTIONS_PROVIDED:
        'Укажите входные и выходные параметры генерации: как минимум --input (путь к спецификации или директории со спецификациями) и --output (директория для сгенерированного клиента).',
    NO_SPEC_FILES_FOUND:
        'Убедитесь, что в указанной директории действительно есть OpenAPI-файлы (.yaml/.yml/.json). При необходимости скорректируйте путь к каталогу со спецификациями.',
    NO_VALID_SPEC_FILES_FOUND:
        'Проверьте формат и структуру файлов спецификаций. Убедитесь, что они соответствуют стандарту OpenAPI v2/v3 и не содержат критических ошибок валидации.',
    PREVIEW_DIR_EMPTY:
        'Сначала выполните генерацию клиента, чтобы появились файлы для сравнения, или укажите другую директорию для превью. Если каталог должен существовать, проверьте правильность пути.',
    PREVIEW_CLEANUP_FAILED:
        'Проверьте права доступа к директории превью и отсутствует ли блокировка файлов сторонними процессами. При необходимости очистите каталог вручную и повторите команду.',
    SPEC_FILES_FIND_ERROR:
        'Проверьте корректность маски поиска и доступ к файловой системе. Убедитесь, что у вас есть права чтения для директории со спецификациями.',
};

export const LOGGER_MESSAGES = {
    // ========== Generation Messages (OpenApiClient) ==========
    GENERATION: {
        STARTED: (count: number) => `Generation has begun. Total number of specification files: ${count}`,
        FINISHED: 'Generation has been finished',
        FINISHED_WITH_DURATION: (duration: string) => `Generation completed in ${duration} sec`,
        DURATION_FOR_FILE: (file: string, duration: string) => `Duration for "${file}": ${duration} sec`,
        NO_OPTIONS: 'No options provided for generation',
    },

    // ========== OpenAPI Specification Messages ==========
    OPENAPI: {
        DEFINING_VERSION: 'Defining the version of the openapi specification (2 or 3)',
        WRITING_V2: 'Write our OpenAPI client version 2 to disk.',
        WRITING_V3: 'Write our OpenAPI client version 3 to disk.',
    },

    // ========== Config Messages (CLI) ==========
    CONFIG: {
        FILE_MISSING: 'The configuration file is missing',
        FILE_MISSING_HINT: 'Provide non-empty "--input" and "--output" options, or a valid "--openapi-config" file path.',
        FILE_NOT_FOUND: (path: string) => `Отсутствует файл: ${path}`,
        FILE_NOT_FOUND_AT: (path: string) => `Configuration file not found at "${path}"`,
        CONVERSION_FAILED: "Couldn't convert the set of options to the current version",
        UPDATING_FAILED: 'Ошибка при обновлении данных конфигурационного файла',
        CHECKING_FAILED: 'Ошибка при проверке данных конфигурационного файла',
        CONFIG_VALID: (path: string) => `Параметры конфигурации в файле "${path}" прошли проверку`,
        CONFIG_UP_TO_DATE: (path: string) => `Данные в файле "${path}" актуальны`,
        FILE_UPDATED: (configPath: string) => `Configuration file "${configPath}" has been updated`,
        ACTION_SKIPPED: 'Action skipped.',
        UNKNOWN_ACTION: (action: string) => `Unknown action: ${action}`,
        ARRAY_DEPRECATED: 'Using an array of configurations is deprecated and support will be removed in future versions. Please switch to using an object with named configurations.',
        CONFIG_EXISTS_INTERACTIVE_DISABLED: (path: string) => `Configuration file already exists and interactive mode is disabled: ${path}`,
        CONFIG_LEFT_UNCHANGED: 'Configuration file left unchanged.',
        CONFIG_CREATED: (path: string) => `Configuration file created: ${path}`,
        EXAMPLE_CONFIG_CREATED: (path: string) =>
            `Example configuration generated and written to: ${path}\n` +
            'You can use it as a template for your actual configuration.',
        CONFIG_GENERATION_CANCELLED: 'Configuration file generation cancelled.',
        SPEC_FILES_FIND_ERROR: (error: string) => `Error finding spec files: ${error}`,
        NO_SPEC_FILES_FOUND: (directory: string) => `No spec files found in directory: ${directory}`,
        NO_VALID_SPEC_FILES_FOUND: 'No valid OpenAPI specification files found.',
        CUSTOM_REQUEST_MISSING_PATH: 'Custom request was selected, but --request path is not provided. The "request" field will be skipped.',
        WARNING_OUTDATED_CONFIG: 'Ваша версия конфигурации устарела и нуждается в обновлении.',
        WARNING_DEFAULT_VALUES: 'В вашей конфигурации есть значения по умолчанию, которые можно удалить.',
        USER_WARNING: (message: string) => `\n${message}\n`,
    },

    // ========== Error Messages ==========
    ERROR: {
        PREFIX: 'Error:',
        GENERIC: (message: string) => message,
        WITH_DETAILS: (message: string, details: string) => `${message}: ${details}`,
    },

    // ========== Separator ==========
    SEPARATOR: '==========================================',

    // ========== Dialog Messages ==========
    DIALOG: {
        OPERATION_CANCELLED: '\nThe operation was canceled by the user.',
        SELECTION_CANCELLED: '\nThe choice is canceled.',
    },

    // ========== Custom Request Messages ==========
    CUSTOM_REQUEST: {
        PATH_NOT_PROVIDED: 'Custom request path is not provided (--request). Skipping custom request file generation.',
        FILE_EXISTS_INTERACTIVE_DISABLED: (file: string) => `Custom request file already exists and interactive mode is disabled: ${file}`,
        FILE_LEFT_UNCHANGED: 'Custom request file left unchanged.',
        FILE_CREATED: (file: string) => `Custom request file created: ${file}`,
    },

    // ========== Spec Validation Messages ==========
    SPEC_VALIDATION: {
        SKIP_INVALID_FILE: (filePath: string) => `Skipping invalid spec file: ${filePath}`,
    },

    // ========== Preview Changes Messages ==========
    PREVIEW: {
        GENERATED_DIR_EMPTY: (dir: string) => `Directory "${dir}" is empty or does not exist. Nothing to compare.`,
        GENERATING_PREVIEW: (dir: string) => `Generating code to preview directory: ${dir}`,
        COMPARING_FILES: 'Comparing files...',
        FILE_NO_CHANGES: (file: string) => `File "${file}" has no changes`,
        DIFF_SAVED: (filePath: string) => `Diff saved: ${filePath}`,
        TOTAL_CHANGES: (count: number) => `\nTotal changes: ${count}`,
        DIFF_FILES_SAVED_TO: (dir: string) => `Diff files saved to: ${dir}`,
        NO_CHANGES_DETECTED: 'No changes detected. All files are identical.',
        CLEANUP_PREVIEW_DIR: (dir: string) => `Cleaning up preview directory: ${dir}`,
        CLEANUP_PREVIEW_FAILED: (error: string) => `Failed to cleanup preview directory: ${error}`,
    },

    // ========== Migration Messages ==========
    MIGRATION: {
        OPENAPI_SCHEMA_MIGRATED: 'To perform OpenAPI generation, it was necessary to migrate the schema of your data to the current one. To update the configuration in the file, use the command `npm openapi-codegen-cli update-config`',
    },
} as const;
