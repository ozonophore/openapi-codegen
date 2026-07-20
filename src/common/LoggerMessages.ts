/**
 * Constants with text messages for Logger
 * All logging texts should be placed here for centralized management
 */
/** CLI error codes for centralized logging. */
export const LOGGER_ERROR_CODES = {
    CONFIG_FILE_MISSING: 'CONFIG_FILE_MISSING',
    CONFIG_FILE_NOT_FOUND_AT: 'CONFIG_FILE_NOT_FOUND_AT',
    NO_OPTIONS_PROVIDED: 'NO_OPTIONS_PROVIDED',
    CONFIG_VALIDATION_FAILED: 'CONFIG_VALIDATION_FAILED',
    NO_SPEC_FILES_FOUND: 'NO_SPEC_FILES_FOUND',
    NO_VALID_SPEC_FILES_FOUND: 'NO_VALID_SPEC_FILES_FOUND',
    PREVIEW_DIR_EMPTY: 'PREVIEW_DIR_EMPTY',
    PREVIEW_CLEANUP_FAILED: 'PREVIEW_CLEANUP_FAILED',
    SPEC_FILES_FIND_ERROR: 'SPEC_FILES_FIND_ERROR',
    PRETTIER_FORMAT_FAILED: 'PRETTIER_FORMAT_FAILED',
    ESLINT_FIX_FAILED: 'ESLINT_FIX_FAILED',
} as const;

/** CLI error code type. */
export type TLoggerErrorCode = keyof typeof LOGGER_ERROR_CODES;

/**
 * Human-readable recommendations for CLI users by error code
 */
export const LOGGER_ERROR_RECOMMENDATIONS: Record<TLoggerErrorCode, string> = {
    CONFIG_FILE_MISSING:
        'Create a configuration file (default: openapi.config.json) or provide its path via the --openapi-config option. Alternatively, pass the required parameters --input and --output directly to the command.',
    CONFIG_FILE_NOT_FOUND_AT: 'Verify the path to the configuration file (--openapi-config) and ensure the file exists on disk. Update the path or create a file with the required parameters.',
    NO_OPTIONS_PROVIDED:
        'Provide the generation input and output parameters: at minimum --input (path to a specification or a directory with specifications) and --output (directory for the generated client).',
    CONFIG_VALIDATION_FAILED:
        'Check the format of openapi.config.json: field names and types must correspond to the current schema. For Marauder, use specAnalysis (not anomalyExploitation/exploitAnomalies) and the object format or boolean shorthand for autoSelect/specAnalysis.',
    NO_SPEC_FILES_FOUND: 'Ensure that the specified directory actually contains OpenAPI files (.yaml/.yml/.json). If necessary, correct the path to the specifications directory.',
    NO_VALID_SPEC_FILES_FOUND: 'Check the format and structure of the specification files. Make sure they conform to the OpenAPI v2/v3 standard and do not contain critical validation errors.',
    PREVIEW_DIR_EMPTY: 'Run code generation first so that files are available for comparison, or specify another preview directory. If the directory should already exist, verify the path is correct.',
    PREVIEW_CLEANUP_FAILED: 'Check the permissions on the preview directory and ensure no file locks are held by other processes. If necessary, clean the directory manually and repeat the command.',
    SPEC_FILES_FIND_ERROR: 'Check the search glob pattern and filesystem read access. Ensure you have read permissions for the specifications directory.',
    PRETTIER_FORMAT_FAILED:
        'Check the syntax of the generated fragment and the Prettier settings (including the prettierConfigPath option). If necessary, provide a valid config path or fix the configuration file.',
    ESLINT_FIX_FAILED: 'Verify that tsconfigPath and eslintConfigPath are correct, that ESLint is installed in the project, and that the generated files are readable and writable.',
};

/** Centralized text messages for Logger. */
export const LOGGER_MESSAGES = {
    // ========== Generation Messages (OpenApiClient) ==========
    GENERATION: {
        STARTED: (count: number) => `Generation has begun. Total number of specification files: ${count}`,
        FINISHED: 'Generation has been finished',
        FINISHED_WITH_DURATION: (duration: string) => `Generation completed in ${duration} sec`,
        DURATION_FOR_FILE: (file: string, duration: string) => `Duration for "${file}": ${duration} sec`,
        NO_OPTIONS: 'No options provided for generation',
        WRITE_STATS: (written: number, unchanged: number) => `[openapi-codegen] Write stats: written=${written}, unchanged=${unchanged}`,
        CACHE_SHARED_OUTPUT_WARNING: (outputs: string) =>
            `[openapi-codegen] Cache is disabled and multiple items write to the same output directories:\n${outputs}\n` +
            'This can overwrite previously generated files in the final output. Consider enabling cache via "cache: true" or "--cache".',
        CACHE_HIT: (input: string) => `[openapi-codegen] Cache hit: ${input}`,
        CACHE_MISS: (input: string) => `[openapi-codegen] Cache miss: ${input}`,
        STRICT_REPORT_CREATED: (reportPath: string) => `Strict OpenAPI report created: ${reportPath}`,
        ANOMALY_REPORT_CREATED: (reportPath: string) => `Anomaly detection report created: ${reportPath}`,
        AUTO_GROUP_REQUIRES_REUSE_CACHE: 'reuseMode: auto-group requires cacheStrategy: reuse — auto-group is ignored, falling back to copy',
        AUTO_GROUP_LCA_TRIVIAL_FALLBACK: 'reuseMode: auto-group: LCA is trivial, falling back to copy',
        SHARED_CORE_CONTENT_CONFLICT: (relativeCorePath: string) => `reuseMode: auto-group: shared core conflict for "${relativeCorePath}" — keeping a full local copy for this item`,
        SHARED_CORE_SERVICES_PATH_COLLISION: (details: string) =>
            `Shared core/services output paths detected (auto-group may still share compatible core under __shared__/core; colliding outputCore/outputServices can overwrite):\n${details}`,
        SHARED_CORE_SERVICES_PATH_COLLISION_MODELS_ONLY: (details: string) => `Shared core/services output paths detected (ReuseStore covers models/schemas only):\n${details}`,
        TRAFFIC_SPLITTER_MULTI_ITEM_WARN: 'trafficSplitter is not intended for multi-item configs — file will be written to the output of the first item',
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
        FILE_NOT_FOUND: (path: string) => `File not found: ${path}`,
        FILE_NOT_FOUND_AT: (path: string) => `Configuration file not found at "${path}"`,
        CONVERSION_FAILED: "Couldn't convert the set of options to the current version",
        UPDATING_FAILED: 'Error updating configuration file data',
        CHECKING_FAILED: 'Error checking configuration file data',
        CONFIG_VALID: (path: string) => `Configuration parameters in "${path}" have passed validation`,
        CONFIG_UP_TO_DATE: (path: string) => `The data in "${path}" is up to date`,
        FILE_UPDATED: (configPath: string) => `Configuration file "${configPath}" has been updated`,
        ACTION_SKIPPED: 'Action skipped.',
        UNKNOWN_ACTION: (action: string) => `Unknown action: ${action}`,
        ARRAY_DEPRECATED: 'Using an array of configurations is deprecated and support will be removed in future versions. Please switch to using an object with named configurations.',
        CONFIG_EXISTS_INTERACTIVE_DISABLED: (path: string) => `Configuration file already exists and interactive mode is disabled: ${path}`,
        CONFIG_LEFT_UNCHANGED: 'Configuration file left unchanged.',
        CONFIG_CREATED: (path: string) => `Configuration file created: ${path}`,
        EXAMPLE_CONFIG_CREATED: (path: string) => `Example configuration generated and written to: ${path}\n` + 'You can use it as a template for your actual configuration.',
        CONFIG_GENERATION_CANCELLED: 'Configuration file generation cancelled.',
        SPEC_FILES_FIND_ERROR: (error: string) => `Error finding spec files: ${error}`,
        NO_SPEC_FILES_FOUND: (directory: string) => `No spec files found in directory: ${directory}`,
        NO_VALID_SPEC_FILES_FOUND: 'No valid OpenAPI specification files found.',
        CUSTOM_REQUEST_MISSING_PATH: 'Custom request was selected, but --request path is not provided. The "request" field will be skipped.',
        WARNING_OUTDATED_CONFIG: 'Your configuration version is outdated and needs to be updated.',
        WARNING_DEFAULT_VALUES: 'Your configuration contains default values that can be removed.',
        USER_WARNING: (message: string) => `\n${message}\n`,
    },

    // ========== Error Messages ==========
    ERROR: {
        PREFIX: 'Error:',
        GENERIC: (message: string) => message,
        WITH_DETAILS: (message: string, details: string) => `${message}: ${details}`,
        TECHNICAL_DETAILS: (error: string) => `Technical details: ${error}`,
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

    // ========== Analyze Diff Messages ==========
    ANALYZE_DIFF: {
        INPUT_REQUIRED: '"--input" option is required for analyze-diff command',
        HISTORY_SKIPPED: 'History analysis skipped: no base spec provided (use --compare-with or --git)',
        ANALYZING: '\n[openapi-codegen] Analyzing OpenAPI changes...',
        SUMMARY_TITLE: '[openapi-codegen] Analyze-diff summary',
        BASE: (base: string) => `Base: ${base}`,
        TARGET: (target: string) => `Target: ${target}`,
        STABILITY_SCORE: (score: number) => `Stability score: ${score}%`,
        CHANGES: (total: number, added: number, removed: number, changed: number) => `Changes: total=${total}, added=${added}, removed=${removed}, changed=${changed}`,
        BREAKING_COUNT: (count: number) => `[openapi-codegen] BREAKING: ${count} item(s)`,
        WARNING_COUNT: (count: number) => `[openapi-codegen] WARNINGS: ${count} item(s)`,
        IGNORED_COUNT: (count: number) => `[openapi-codegen] IGNORED: ${count} item(s) by config rules`,
        REPORT_WRITTEN: (reportPath: string) => `[openapi-codegen] Report written to: ${reportPath}`,
        INVALID_IGNORE_PATTERN: (pattern: string, error: string) => `[openapi-codegen] Invalid ignore pattern: ${pattern} — ${error}`,
        STARTED: (newSpec: string, baseSource: string) => `Starting analyze-diff: input=${newSpec}, base=${baseSource}`,
        SKIPPED_NO_BASE: 'History analysis skipped: no base spec provided (use --compare-with or --git).',
        VALIDATION_ERROR: (message: string) => `Analyze-diff options validation failed: ${message}`,
        COMPARE_WITH_OVERRIDES_GIT: (gitRef: string) => `Option "--compare-with" has priority over "--git". Ignoring git ref "${gitRef}".`,
        PLUGIN_DIAGNOSTIC: (diagnostic: { pluginName: string; hook: string; status: string; durationMs: number; message?: string }) => {
            const messageSuffix = diagnostic.message ? `: ${diagnostic.message}` : '';
            return `[plugin:${diagnostic.pluginName}] hook=${diagnostic.hook} status=${diagnostic.status} duration=${diagnostic.durationMs}ms${messageSuffix}`;
        },
        REPORT_CREATED: (reportPath: string) => `Semantic diff report created: ${reportPath}`,
        SUMMARY: (
            report: {
                summary: { breaking: number; nonBreaking: number; informational: number };
                governance: { summary: { errors: number; warnings: number; info: number } };
            },
            reportPath: string
        ) =>
            `Summary: report=${reportPath}, breaking=${report.summary.breaking}, nonBreaking=${report.summary.nonBreaking}, informational=${report.summary.informational}, governanceErrors=${report.governance.summary.errors}, governanceWarnings=${report.governance.summary.warnings}, governanceInfo=${report.governance.summary.info}`,
        RECOMMENDATION: (report: { recommendation: { semver: string; reason: string; confidence: string; reasons: string[] } }) =>
            `Recommended version bump: ${report.recommendation.semver} (${report.recommendation.reason}, confidence=${report.recommendation.confidence}, reasons=${report.recommendation.reasons.join(',')})`,
        GOVERNANCE: (report: { governance: { summary: { errors: number; warnings: number; info: number } } }) =>
            `Governance: errors=${report.governance.summary.errors}, warnings=${report.governance.summary.warnings}, info=${report.governance.summary.info}`,
        CI_MARKDOWN_SUMMARY: (markdown: string) => markdown,
        CI_FAILURE: 'CI mode failed because governance errors were found.',
        IGNORED_CHANGES: (count: number) => `[openapi-codegen] IGNORED: ${count} semantic change(s) filtered by analyze.ignore`,
        EXECUTION_ERROR: (message: string) => `Analyze-diff execution failed: ${message}`,
        LEGACY_BASE: (base: string) => `Base: ${base}`,
        LEGACY_TARGET: (target: string) => `Target: ${target}`,
        LEGACY_STABILITY_SCORE: (score: number) => `Stability score: ${score}%`,
        LEGACY_CHANGES: (stats: { totalChanges: number; added: number; removed: number; changed: number }) =>
            `Changes: total=${stats.totalChanges}, added=${stats.added}, removed=${stats.removed}, changed=${stats.changed}`,
        LEGACY_BREAKING: (count: number) => `[openapi-codegen] BREAKING: ${count} item(s)`,
        LEGACY_WARNINGS: (count: number) => `[openapi-codegen] WARNINGS: ${count} item(s)`,
        LEGACY_IGNORED: (count: number) => `[openapi-codegen] IGNORED: ${count} item(s) by config rules`,
    },

    DIFF_REPORT: {
        NOT_FOUND: (reportPath: string) => `[openapi-codegen] Diff report not found at "${reportPath}". Skipping history annotations.`,
        STALE: (reportPath: string) => `[openapi-codegen] Diff report "${reportPath}" is older than the input spec. Skipping history annotations.`,
        EMPTY: (reportPath: string) => `[openapi-codegen] Diff report "${reportPath}" has no entries. Skipping history annotations.`,
        LOADED: (reportPath: string, diffCount: number, miracleCount: number) => `[openapi-codegen] Loaded diff report "${reportPath}" (${diffCount} change(s), ${miracleCount} miracle(s)).`,
        USE_HISTORY_NO_REPORT: (reportPath: string) => `[openapi-codegen] useHistory is enabled but no diff report was loaded from "${reportPath}". Skipping history annotations.`,
        READ_FAILED: (reportPath: string, message: string) => `[openapi-codegen] Failed to read diff report "${reportPath}": ${message}`,
    },

    TEMPLATES: {
        PRECOMPILE_SUCCESS: 'The templates have been successfully precompiled and saved!',
        PRECOMPILE_ERROR: (message: string) => `Error during pre-compilation of templates: ${message}`,
    },

    WRITE_CLIENT: {
        DATA_WRITE_START: (filePath: string) => `The recording of the file data begins: ${filePath}`,
        FILE_RECORDED: (filePath: string) => `File recording completed: ${filePath}`,
        INDEX_DATA_WRITTEN: (filePath: string) => `Data has been written to a file: ${filePath}`,
        INDEX_WRITE_COMPLETED: (filePath: string) => `Writing to the file is completed: ${filePath}`,
        CORE_START: 'The recording of the kernel files begins',
        CORE_FINISH: 'The writing of the kernel files has been completed successfully',
        MODELS_START: 'Recording of model files begins',
        MODELS_FINISH: 'Model file recording completed successfully',
        SERVICES_START: 'Recording of service files begins',
        SERVICES_FINISH: 'Service file recording completed successfully',
        SCHEMAS_START: 'The recording of model validation schema files begins.',
        SCHEMAS_FINISH: 'The recording of model validation schema files has been completed successfully',
        DIRECTORY_CREATING: (directory: string) => `A directory is being created: ${directory}`,
        EXECUTOR_START: (filePath: string) => `The recording of the file data begins: ${filePath}`,
    },

    LOGGER: {
        NEXT_STEPS: (recommendation: string) => `What you can do next: ${recommendation}`,
    },

    // ========== Migration Messages ==========
    MIGRATION: {
        OPENAPI_SCHEMA_MIGRATED:
            'To perform OpenAPI generation, it was necessary to migrate the schema of your data to the current one. To update the configuration in the file, use the command `npm openapi-codegen-cli update-config`',
    },

    // ========== Formatting Messages ==========
    FORMATTING: {
        PRETTIER_CONFIG_RESOLVED: (filePath: string) => `Prettier config resolved from: ${filePath}`,
        PRETTIER_CONFIG_NOT_FOUND: (configPath: string) => `Prettier config not found at "${configPath}", falling back to built-in options`,
        PRETTIER_FORMAT_FAILED: (file: string, error: string) => `Prettier formatting failed for "${file}": ${error}`,
        ESLINT_NOT_INSTALLED: 'ESLint is not installed in this project. Skipping batch ESLint fix.',
        ESLINT_FIX_FAILED: (file: string, error: string) => `ESLint fix failed for "${file}": ${error}`,
        ESLINT_FIX_APPLIED: (file: string) => `ESLint fix applied: ${file}`,
        ESLINT_PATHS_MISSING: 'Batch ESLint fix requires both tsconfigPath and eslintConfigPath. Skipping batch ESLint fix.',
        ESLINT_BATCH_STARTED: 'Batch ESLint fix started for generated models and services',
        ESLINT_BATCH_FINISHED: (durationSec: string) => `Batch ESLint fix completed in ${durationSec} sec`,
        ESLINT_BATCH_COMPLETED: (reportPath: string) => `Batch ESLint fix completed. Report: ${reportPath}`,
        ESLINT_BATCH_COMPLETED_WITH_ISSUES: (errors: number, warnings: number, reportPath: string) =>
            `Batch ESLint fix completed with ${errors} error(s) and ${warnings} warning(s). Report: ${reportPath}`,
        ESLINT_BATCH_FAILED: (error: string) => `Batch ESLint fix failed: ${error}`,
        ESLINT_BATCH_CHUNK_FAILED: (error: string) => `Batch ESLint fix chunk failed: ${error}`,
    },
} as const;
