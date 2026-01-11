#!/usr/bin/env node
import { Command, Option, OptionValues } from 'commander';
import fs from 'fs';

import { APP_LOGGER, DEFAULT_OPENAPI_CONFIG_FILENAME } from '../common/Consts';
import { ELogLevel, ELogOutput } from '../common/Enums';
import { UpdateNotifier } from '../common/UpdateNotifier';
import { joinHelper } from '../common/utils/pathHelpers';
import { HttpClient } from '../core/types/enums/HttpClient.enum';
import { ValidationLibrary } from '../core/types/enums/ValidationLibrary.enum';
import { checkConfig } from './checkAndUpdateConfig/checkConfig';
import { updateConfig } from './checkAndUpdateConfig/updateConfig';
import { generateOpenApiClient } from './generateOpenApiClient/generateOpenApiClient';
import { EOptionType } from './initOpenApiConfig/Enums';
import { runInitOpenapiConfig } from './initOpenApiConfig/runInitOpenapiConfig';
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
    .option('--excludeCoreServiceFiles', 'The generation of the core and services is excluded (default: false)')
    .option('--request <value>', 'Path to custom request file')
    .option('--interfacePrefix <value>', 'Prefix for interface model(default: "I")', 'I')
    .option('--enumPrefix <value>', 'Prefix for enum model(default: "E")', 'E')
    .option('--typePrefix <value>', 'Prefix for type model(default: "T")', 'T')
    .option('--useCancelableRequest', 'Use cancelled promise as returned data type in request (default: false)')
    .addOption(new Option('-l, --logLevel <level>', 'Logging level').choices([...Object.values(ELogLevel)]).default(ELogLevel.ERROR))
    .addOption(new Option('-t, --logTarget <target>', 'Target of logging').choices([...Object.values(ELogOutput)]).default(ELogOutput.CONSOLE))
    .option('-s, --sortByRequired', 'Property sorting strategy: simplified or extended')
    .option('--useSeparatedIndexes', 'Use separate index files for the core, models, schemas, and services.')
    .addOption(new Option('--validationLibrary <value>', 'Validation library to use for schema validation').choices([...Object.values(ValidationLibrary)]).default(ValidationLibrary.NONE))
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
        await checkConfig(options.openapiConfig);
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
        await updateConfig(options.openapiConfig);
    });

/**
 * init - Команда для инициализации конфигурационного файла
 */
program
    .command('init')
    .description('Generates a configuration file template for a set of single or multiple options')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .addOption(
        new Option('-t, --type <type>', 'A variant of the set of options for running the client generator (default: "OPTION")').choices([...Object.values(EOptionType)]).default(EOptionType.OPTION)
    )
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        await runInitOpenapiConfig(options);
    });

/**
 * preview-changes - Команда для предпросмотра изменений перед генерацией
 */
program
    .command('preview-changes')
    .description('Preview changes that will be made to generated code before applying them')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .option('-gd, --generated-dir <value>', 'Directory with previously generated code (default: "generated")', './generated')
    .option('-pd, --preview-dir <value>', 'Temporary directory for preview generation (default: "generated-preview")', './generated-preview')
    .option('-dd, --diff-dir <value>', 'Directory to save diff files (default: "generated-diff")', './generated-diff')
    .hook('preAction', async () => {
        await updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        await previewChanges(options);
    });

program.exitOverride();
// TODO: Включить позже!
// program.showSuggestionAfterError(false);

// Парсирование аргументов с обработкой ошибок
try {
    program.parse(process.argv);
} catch (error: any) {
    if (error.code === 'commander.unknownOption') {
        const errorMessage = error?.message ?? '';
        if (errorMessage) {
            APP_LOGGER.error(errorMessage);
        }
    }
}
