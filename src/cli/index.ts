import { Command, Option, OptionValues } from 'commander';
import fs from 'fs';

import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../common/Consts';
import { ELogLevel, ELogOutput } from '../common/Enums';
import { Logger } from '../common/Logger';
import { UpdateNotifier } from '../common/UpdateNotifier';
import { joinHelper } from '../common/utils/pathHelpers';
import { HttpClient } from '../core/types/enums/HttpClient.enum';
import { chekOpenApiConfig } from './chekOpenApiConfig/chekOpenApiConfig';
import { runGenerateOpenApi } from './generate/runGenerateOpenApi';
import { EOptionType } from './initOpenApiConfig/Enums';
import { runInitOpenapiConfig } from './initOpenApiConfig/runInitOpenapiConfig';
import { getCLIName } from './utils';

const packageDetails = JSON.parse(fs.readFileSync(joinHelper(__dirname, '../../package.json'), 'utf-8'));

const APP_NAME = packageDetails.name || 'ts-openapi-codegen-cli';
const APP_VERSION = packageDetails.version || '1.0.0';
const APP_DESCRIPTION = packageDetails.description || 'Description';

const updateNotifier = new UpdateNotifier(APP_NAME, APP_VERSION);

const program = new Command();

program.version(APP_VERSION).name(APP_NAME).description(APP_DESCRIPTION).addHelpText('before', getCLIName(APP_NAME));

program
    .command('generate')
    .description('Starts code generation based on the provided opeanpi specifications')
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
    .option('--excludeCoreServiceFiles','The generation of the core and services is excluded (default: false)')
    .option('--includeSchemasFiles','The generation of model validation schemes is enabled (default: false)')
    .option('--request <value>', 'Path to custom request file')
    .option('--interfacePrefix <value>', 'Prefix for interface model(default: "I")', "I")
    .option('--enumPrefix <value>', 'Prefix for enum model(default: "E")', "E")
    .option('--typePrefix <value>', 'Prefix for type model(default: "T")', "T")
    .option('--useCancelableRequest', 'Use cancelled promise as returned data type in request (default: false)')
    .addOption(new Option('-l, --logLevel <level>', 'Logging level').choices([...Object.values(ELogLevel)]).default(ELogLevel.ERROR))
    .addOption(new Option('-t, --logTarget <target>', 'Target of logging').choices([...Object.values(ELogOutput)]).default(ELogOutput.CONSOLE))
    .option('-s, --sortByRequired', 'Property sorting strategy: simplified or extended')
    .option('--useSeparatedIndexes', 'Use separate index files for the core, models, schemas, and services.')
    .hook('preAction', () => {
        updateNotifier.checkAndNotify();
    })
    .action(async (options: OptionValues) => {
        await runGenerateOpenApi(options);
    });

program
    .command('check-openapi-config')
    .description('Starts checking whether the configuration file data is filled in correctly.')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .hook('preAction', () => {
        updateNotifier.checkAndNotify();
    })
    .action((options: OptionValues) => {
        chekOpenApiConfig(options?.openapiConfig);
    });

program
    .command('init-openapi-config')
    .description('Generates a configuration file template for a set of single options or multiple options')
    .addHelpText('before', getCLIName(APP_NAME))
    .option('-ocn, --openapi-config <value>', 'The path to the configuration file, listing the options', DEFAULT_OPENAPI_CONFIG_FILENAME)
    .addOption(new Option('-t, --type <type>', 'A variant of the set of options for running the client generator (default: "OPTION")').choices([...Object.values(EOptionType)]).default(EOptionType.OPTION))
    .hook('preAction', () => {
        updateNotifier.checkAndNotify();
    })
    .action((options: OptionValues) => {
        runInitOpenapiConfig(options);
    });

try {
    program.parse(process.argv);
} catch (error: any) {
    if (error.code === 'commander.unknownOption') {
        const errorMessage = error?.message ?? '';
        if (errorMessage) {
            const logger = new Logger({
                level: ELogLevel.INFO,
                instanceId: 'check-openapi-config',
                logOutput: ELogOutput.CONSOLE,
            });

            logger.error(errorMessage);
        }
    }
}
