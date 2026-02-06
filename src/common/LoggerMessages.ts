/**
 * Константы с текстовыми сообщениями для Logger
 * Все тексты для логирования должны быть вынесены сюда для централизованного управления
 */
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

    // ========== File Writing Messages (WriteClient) ==========
    FILES: {
        // Core files
        CORE_RECORDING_STARTED: 'The recording of the kernel files begins',
        CORE_RECORDING_COMPLETED: 'The writing of the kernel files has been completed successfully',
        
        // Service files
        SERVICES_RECORDING_STARTED: 'Recording of service files begins',
        SERVICES_RECORDING_COMPLETED: 'Service file recording completed successfully',
        SERVICE_FILE_STARTED: (file: string) => `The recording of the file data begins: ${file}`,
        SERVICE_FILE_COMPLETED: (file: string) => `File recording completed: ${file}`,
        
        // Model files
        MODELS_RECORDING_STARTED: 'Recording of model files begins',
        MODELS_RECORDING_COMPLETED: 'Model file recording completed successfully',
        MODEL_FILE_STARTED: (file: string) => `The recording of the file data begins: ${file}`,
        MODEL_FILE_COMPLETED: (file: string) => `File recording completed: ${file}`,
        MODEL_DIRECTORY_CREATING: (directory: string) => `A directory is being created: ${directory}`,
        
        // Schema files
        SCHEMAS_RECORDING_STARTED: 'The recording of model validation schema files begins.',
        SCHEMAS_RECORDING_COMPLETED: 'The recording of model validation schema files has been completed successfully',
        SCHEMA_FILE_STARTED: (file: string) => `The recording of the file data begins: ${file}`,
        SCHEMA_FILE_COMPLETED: (file: string) => `File recording completed: ${file}`,
        SCHEMA_DIRECTORY_CREATING: (directory: string) => `A directory is being created: ${directory}`,
        
        // Index files
        INDEX_DATA_WRITTEN: (filePath: string) => `Data has been written to a file: ${filePath}`,
        INDEX_WRITING_COMPLETED: (filePath: string) => `Writing to the file is completed: ${filePath}`,
        SIMPLE_INDEX_STARTED: (filePath: string) => `The recording of the file data begins: ${filePath}`,
        SIMPLE_INDEX_COMPLETED: (filePath: string) => `File recording completed: ${filePath}`,
    },

    // ========== Update Notifier Messages ==========
    UPDATE_NOTIFIER: {
        MISSING_PARAMS: (packageName: string, packageVersion: string) => `
            The necessary parameters for checking the version are not specified.
            Current values packageName: ${packageName}, packageVersion: ${packageVersion}
        `,
        STORE_NOT_CREATED: 'The settings store has not been created. The package update will be checked more often than once every 1 week!',
        CANT_GET_VERSION: "Couldn't get information about the latest current version",
    },

    // ========== Template Precompilation Messages ==========
    TEMPLATES: {
        PRECOMPILATION_SUCCESS: 'The templates have been successfully precompiled and saved!',
        PRECOMPILATION_ERROR: (error: string) => `Error during pre-compilation of templates: ${error}`,
    },

    // ========== Config Messages (CLI) ==========
    CONFIG: {
        FILE_RECORDING_COMPLETED: (file: string) => `File recording completed: ${file}`,
        FILE_ALREADY_EXISTS: (fileName: string) => `The configuration file already exists: ${fileName}`,
        FILE_MISSING: 'The configuration file is missing',
        CONVERSION_FAILED: "Couldn't convert the set of options to the current version",
        FILE_UPDATED: (configPath: string) => `Configuration file "${configPath}" has been updated`,
        ACTION_SKIPPED: 'Action skipped.',
        UNKNOWN_ACTION: (action: string) => `Unknown action: ${action}`,
    },

    // ========== Error Messages ==========
    ERROR: {
        PREFIX: 'Error:',
        GENERIC: (message: string) => message,
    },

    // ========== Separator ==========
    SEPARATOR: '==========================================',
} as const;