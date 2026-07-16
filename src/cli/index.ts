#!/usr/bin/env node
import { Command, Option, OptionValues } from 'commander';
import fs from 'fs';

import {
    APP_LOGGER,
    COMMON_DEFAULT_OPTIONS_VALUES,
    DEFAULT_ANALYZE_USAGE_REPORT_PATH,
    DEFAULT_DIFF_CHANGES_DIR,
    DEFAULT_OPENAPI_CONFIG_FILENAME,
    DEFAULT_OUTPUT_API_DIR,
    DEFAULT_PREVIEW_CHANGES_DIR,
} from '../common/Consts';
import { ELogLevel, ELogOutput } from '../common/Enums';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import { UpdateNotifier } from '../common/UpdateNotifier';
import { joinHelper } from '../common/utils/pathHelpers';
import { EmptySchemaStrategy } from '../core/types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../core/types/enums/HttpClient.enum';
import { ModelsMode } from '../core/types/enums/ModelsMode.enum';
import { ValidationLibrary } from '../core/types/enums/ValidationLibrary.enum';
import { analyzeDiff } from './analyzeDiff/analyzeDiff';
import { analyzeUsage } from './analyzeUsage/analyzeUsage';
import { checkConfig } from './checkAndUpdateConfig/checkConfig';
import { updateConfig } from './checkAndUpdateConfig/updateConfig';
import { generateOpenApiClient } from './generateOpenApiClient/generateOpenApiClient';
import { init } from './initOpenApiConfig/init';
import { previewChanges } from './previewChanges/previewChanges';
import { CLICommandResult } from './types';
import { getCLIName } from './utils';
import { mergeNestedCliOptions, parseNestedCliOptions } from './utils/parseNestedCliOptions';

const packageDetails = JSON.parse(fs.readFileSync(joinHelper(__dirname, '../../package.json'), 'utf-8'));

const APP_NAME = packageDetails.name || 'ts-openapi-codegen-cli';
const APP_VERSION = packageDetails.version || '1.0.0';
const APP_DESCRIPTION = packageDetails.description || 'Description';

const updateNotifier = new UpdateNotifier({
    packageName: APP_NAME,
    packageVersion: APP_VERSION,
});

const program = new Command();

const finishCommand = (result?: CLICommandResult): never => {
    if (!result || !result.success) {
        process.exit(1);
    }
    process.exit(0);
};

program.version(APP_VERSION).name(APP_NAME).description(APP_DESCRIPTION).addHelpText('before', getCLIName(APP_NAME));

/**
 * generate - Команда для генерации кода на основе OpenAPI спецификации
 */
program
    .command('generate')
    .description('Starts code generation based on the provided openapi specifications')
    .addHelpText('before', getCLIName(APP_NAME))
    .usage('[options]')
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .option('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)', '')
    .option('-o, --output <value>', 'Output directory (required)', '')
    .option('-oc, --outputCore <value>', 'Output directory for core files')
    .option('-os, --outputServices <value>', 'Output directory for services')
    .option('-om, --outputModels <value>', 'Output directory for models')
    .option('-osm, --outputSchemas <value>', 'Output directory for schemas')
    .addOption(new Option('-c, --httpClient <value>', 'HTTP client to generate').choices([...Object.values(HttpClient)]).default(HttpClient.FETCH))
    .option('--useOptions', 'Use options instead of arguments (default: false)')
    .option('--useUnionTypes', 'Use union types instead of enums (default: false)')
    .option('--useHistory', 'Apply diff report annotations during generation (default: false)')
    .option('--diffReport <value>', 'Path to a diff report JSON file')
    .addOption(new Option('--modelsMode <value>', 'Models generation mode').choices([...Object.values(ModelsMode)]).default(ModelsMode.INTERFACES))
    .option('--excludeCoreServiceFiles', 'The generation of the core and services is excluded (default: false)')
    .option('--request <value>', 'Path to custom request file')
    .option('--customExecutorPath <value>', 'Path to custom createExecutorAdapter module')
    .option('--interfacePrefix <value>', 'Prefix for interface model(default: "I")', 'I')
    .option('--enumPrefix <value>', 'Prefix for enum model(default: "E")', 'E')
    .option('--typePrefix <value>', 'Prefix for type model(default: "T")', 'T')
    .option('--useCancelableRequest', 'Use cancelled promise as returned data type in request (default: false)')
    .addOption(new Option('-l, --logLevel <level>', 'Logging level').choices([...Object.values(ELogLevel)]).default(ELogLevel.ERROR))
    .addOption(new Option('-t, --logTarget <target>', 'Target of logging').choices([...Object.values(ELogOutput)]).default(ELogOutput.CONSOLE))
    .option('-s, --sortByRequired', 'Property sorting strategy: simplified or extended')
    .option('--useSeparatedIndexes', 'Use separate index files for the core, models, schemas, and services.')
    .option('--strict-openapi', 'Enable strict OpenAPI diagnostics report and fail generation when strict errors are found')
    .option('--fail-on-governance-errors', 'When used with --strict-openapi, fail generation when governance policy reports errors')
    .option('--report-file <value>', 'Path to strict OpenAPI diagnostics report JSON file', COMMON_DEFAULT_OPTIONS_VALUES.reportFile)
    .option('--governance-config <value>', 'Path to governance rules JSON config file')
    .addOption(new Option('--validationLibrary <value>', 'Validation library to use for schema validation').choices([...Object.values(ValidationLibrary)]).default(ValidationLibrary.NONE))
    .addOption(new Option('--emptySchemaStrategy <value>', 'How to handle empty generated schemas').choices([...Object.values(EmptySchemaStrategy)]).default(EmptySchemaStrategy.KEEP))
    .option('--prettierConfigPath <value>', 'Path to Prettier config file for formatting generated code')
    .option('--tsconfigPath <value>', 'Path to project tsconfig.json for batch ESLint fix (requires --eslintConfigPath)')
    .option('--eslintConfigPath <value>', 'Path to project ESLint config for batch ESLint fix (requires --tsconfigPath)')
    .option('--cache', 'Enable generation cache (default: disabled)')
    .option('--cachePath <value>', 'Path to generation cache file relative to output directory (default: .openapi-codegen-store)')
    .addOption(new Option('--cacheStrategy <value>', 'Cache strategy').choices(['content', 'entity', 'reuse']))
    .addOption(new Option('--reuseOnConflict <value>', 'Reuse store conflict policy when cacheStrategy is reuse').choices(['fail', 'namespace']))
    .option('--cacheDebug', 'Show cache hit/miss debug logs (default: false)')
    .option(
        '--auto-select',
        'Enable automatic selection of optimal validators and HTTP clients based on project analysis. Supports JSON object or dot-notation flags like --auto-select.strict (default: false)'
    )
    .option('--spec-analysis', 'Enable detection and reporting of API specification anomalies. Supports JSON object or dot-notation flags like --spec-analysis.fail-on-high (default: false)')
    .option('--anomaly-detection', 'Deprecated alias for --spec-analysis. Supports JSON object or dot-notation flags like --anomaly-detection.fail-on-anomalies (default: false)')
    .option('--workspace-report', 'Enable workspace report generation for multi-spec runs. Supports dot-notation: --workspace-report.format, --workspace-report.path (default: false)')
    .option(
        '--traffic-splitter',
        'Enable traffic splitter module generation for canary migrations. Supports dot-notation: --traffic-splitter.strategy, --traffic-splitter.old-client-weight, etc. (default: false)'
    )
    .option('--swarm', 'Enable AvatarSwarm manifest generation. Supports dot-notation: --swarm.output (default: false)')
    .option('--pre-analyze', 'Run cross-spec pre-generation analysis and print findings to stdout before writing any files (default: false)')
    .addOption(new Option('--reuse-mode <value>', 'Reuse deduplication mode when cacheStrategy is reuse').choices(['copy', 'auto-group']))
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        const result = await generateOpenApiClient(mergeNestedCliOptions(options, preParsedNestedOptions));
        finishCommand(result);
    });

/**
 * check - Команда для проверки конфигурационного файла
 */
program
    .command('check-config')
    .description('Checks if the configuration file data is filled in correctly')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        const result = await checkConfig(options);
        finishCommand(result);
    });

/**
 * update - Команда для обновления конфигурационного файла
 */
program
    .command('update-config')
    .description('Updates the configuration file to the latest version')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        const result = await updateConfig(options);
        finishCommand(result);
    });

/**
 * init - Команда для инициализации конфигурационного файла
 */
program
    .command('init')
    .description('Generates a configuration file template for a set of single or multiple options')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .option('-sd, --specs-dir <value>', 'Path to directory with specification files', './openapi')
    .option('--request <value>', 'Path to custom request file')
    .option('--requestFormat <value>', 'Scaffold format for --request: transport | adapter | executor (default: transport)')
    .option('--useCancelableRequest', 'Use cancelled promise as returned data type in request (default: false)')
    .option('--useInteractiveMode', 'Use interactive command mode. Questions will be asked in the terminal (default: false)')
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        const result = await init(options);
        finishCommand(result);
    });

/**
 * preview-changes - Команда для предпросмотра изменений перед генерацией
 */
program
    .command('preview-changes')
    .description('Preview changes that will be made to generated code before applying them')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options (default: "openapi.config.json")', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .option('-gd, --generated-dir <value>', 'Directory with previously generated code (default: "generated")', DEFAULT_OUTPUT_API_DIR)
    .option('-pd, --preview-dir <value>', 'Temporary directory for preview generation (default: ".ts-openapi-codegen-preview-changes)', DEFAULT_PREVIEW_CHANGES_DIR)
    .option('-dd, --diff-dir <value>', 'Directory to save diff files (default: ".ts-openapi-codegen-diff-changes")', DEFAULT_DIFF_CHANGES_DIR)
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        const result = await previewChanges(options);
        finishCommand(result);
    });

/**
 * analyze-diff - Команда для анализа изменений между двумя версиями OpenAPI спецификации
 */
program
    .command('analyze-diff')
    .description('Analyzes differences between two OpenAPI specifications and produces a JSON report')
    .addHelpText('before', getCLIName(APP_NAME))
    .addHelpText(
        'after',
        [
            '',
            'Base source resolution:',
            '  1) --compare-with has priority over --git when both are provided.',
            '  2) --git is used only when --compare-with is not provided.',
            '  3) when neither is provided, analyze-diff is skipped with exit code 0.',
        ].join('\n')
    )
    .option('-i, --input <value>', 'Path to current OpenAPI specification file (required)')
    .option('--compare-with <value>', 'Path to previous OpenAPI specification file (overrides --git when both are provided)')
    .option('--git <ref>', 'Git ref to read previous specification version from (used when --compare-with is not set)')
    .option('--output-report <value>', 'Path to save JSON diff report')
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options (default: "openapi.config.json")', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .option('--governance-config <value>', 'Path to governance rules JSON config file')
    .option('--strict-plugin-mode', 'Fail when plugin hook execution throws')
    .option('--ci', 'Exit with code 1 when governance errors are found')
    .option('--allow-breaking', 'Allow breaking changes in governance checks')
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        const result = await analyzeDiff(options);
        finishCommand(result);
    });

/**
 * analyze-usage - Команда для анализа использования generated API в consumer-проекте
 */
program
    .command('analyze-usage')
    .description('Analyzes generated API usage in a TypeScript consumer project and produces usage reports')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-s, --sourcePath <value>', 'Path to generated API file')
    .option('-p, --projectPath <value>', 'Root of your React/TS project')
    .option('-t, --tsconfigPath <value>', 'Optional path to tsconfig.json')
    .option('-o, --output <value>', 'Output report filename', DEFAULT_ANALYZE_USAGE_REPORT_PATH)
    .option('-c, --check', 'CI mode (exit code 1 when errors are found)')
    .option('--diff-report <value>', 'Path to analyze-diff report JSON for rename miracle validation')
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        const result = await analyzeUsage(options);
        finishCommand(result);
    });

program.exitOverride();
program.showSuggestionAfterError(false);

const { cleanedArgv, nestedOptions: preParsedNestedOptions } = parseNestedCliOptions(process.argv);

// Парсирование аргументов с обработкой ошибок
try {
    program.parse(cleanedArgv);
} catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'commander.unknownOption') {
        const errorMessage = (error as { message?: string })?.message ?? '';
        if (errorMessage) {
            APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(errorMessage));
            void APP_LOGGER.shutdownLoggerAsync().then(() => process.exit(1));
        }
    }
}
