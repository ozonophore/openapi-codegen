#!/usr/bin/env node
import { Command, Option, OptionValues } from 'commander';
import fs from 'fs';

import { APP_LOGGER, DEFAULT_DIFF_CHANGES_DIR, DEFAULT_OPENAPI_CONFIG_FILENAME, DEFAULT_OUTPUT_API_DIR, DEFAULT_PREVIEW_CHANGES_DIR } from '../common/Consts';
import { ELogLevel, ELogOutput } from '../common/Enums';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import { UpdateNotifier } from '../common/UpdateNotifier';
import { joinHelper } from '../common/utils/pathHelpers';
import { EmptySchemaStrategy } from '../core/types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../core/types/enums/HttpClient.enum';
import { ModelsMode } from '../core/types/enums/ModelsMode.enum';
import { ValidationLibrary } from '../core/types/enums/ValidationLibrary.enum';
import { analyzeDiff } from './analyzeDiff/analyzeDiff';
import { checkConfig } from './checkAndUpdateConfig/checkConfig';
import { updateConfig } from './checkAndUpdateConfig/updateConfig';
import { generateOpenApiClient } from './generateOpenApiClient/generateOpenApiClient';
import { init } from './initOpenApiConfig/init';
import { previewChanges } from './previewChanges/previewChanges';
import { getCLIName } from './utils';

const packageDetails = JSON.parse(fs.readFileSync(joinHelper(__dirname, '../../package.json'), 'utf-8'));

const APP_NAME = packageDetails.name || 'ts-openapi-codegen-cli';
const APP_VERSION = packageDetails.version || '1.0.0';
const APP_DESCRIPTION = packageDetails.description || 'Description';

const updateNotifier = new UpdateNotifier({
    packageName: APP_NAME,
    packageVersion: APP_VERSION,
});

const program = new Command();

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
    .option('--report-file <value>', 'Path to strict OpenAPI diagnostics report JSON file', './openapi-report.json')
    .addOption(new Option('--validationLibrary <value>', 'Validation library to use for schema validation').choices([...Object.values(ValidationLibrary)]).default(ValidationLibrary.NONE))
    .addOption(new Option('--emptySchemaStrategy <value>', 'How to handle empty generated schemas').choices([...Object.values(EmptySchemaStrategy)]).default(EmptySchemaStrategy.KEEP))
    .option('--useProjectPrettier', 'Use project Prettier config for formatting generated code (default: false)')
    .option('--useEslintFix', 'Run ESLint --fix on generated files after writing (default: false)')
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        await generateOpenApiClient(options);
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
        await checkConfig(options);
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
        await updateConfig(options);
    });

/**
 * init - Команда для инициализации конфигурационного файла
 */
program
    .command('init')
    .description('Generates a configuration file template for a set of single or multiple options')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .option('-sd, --specs-dir <value>', 'Путь до директории с файлами спецификации', './openapi')
    .option('--request <value>', 'Path to custom request file')
    .option('--useCancelableRequest', 'Use cancelled promise as returned data type in request (default: false)')
    .option('--useInteractiveMode', 'Использовать интерактивный режим команды. В терминале будут задаваться вопросы  (default: false)')
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        await init(options);
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
        await previewChanges(options);
    });

/**
 * analyze-diff - Команда для анализа изменений между двумя версиями OpenAPI спецификации
 * 
 * @example Как использовать сейчас
 * Сравнение с явным старым файлом:
 * openapi-codegen-cli analyze-diff \
 * --input ./openapi/current.yaml \
 * --compare-with ./openapi/previous.yaml \
 * --output-report ./openapi-diff-report.json
 * 
 * Сравнение с версией из Git:
 * openapi-codegen-cli analyze-diff \
 * --input openapi/spec.yaml \
 * --git HEAD~1
 */
program
    .command('analyze-diff')
    .description('Analyzes differences between two OpenAPI specifications and produces a JSON report')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-i, --input <value>', 'Path to current OpenAPI specification file (required)')
    .option('--compare-with <value>', 'Path to previous OpenAPI specification file')
    .option('--git <ref>', 'Git ref to read previous specification version from (e.g. HEAD~1)')
    .option('--output-report <value>', 'Path to save JSON diff report')
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options (default: "openapi.config.json")', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        const result = await analyzeDiff(options);
        if (!result || !result.success) {
            process.exit(1);
        }
        process.exit(0);
    });

program.exitOverride();
program.showSuggestionAfterError(false);

// Парсирование аргументов с обработкой ошибок
try {
    program.parse(process.argv);
} catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'commander.unknownOption') {
        const errorMessage = (error as { message?: string })?.message ?? '';
        if (errorMessage) {
            APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(errorMessage));
            void APP_LOGGER.shutdownLoggerAsync().then(() => process.exit(1));
        }
    }
}
