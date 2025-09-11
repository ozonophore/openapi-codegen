import { Command, Option, OptionValues } from 'commander';
import fs from 'fs';
import path from 'path';

import { ELogLevel, ELogOutput } from '../common/Enums';
import { Logger } from '../common/Logger';
import { UpdateNotifier } from '../common/UpdateNotifier';
import { HttpClient } from '../core/types/Enums';
import { chekOpenApiConfig } from './chekOpenApiConfig/chekOpenApiConfig';
import { runGenerateOpenApi } from './generate/runGenerateOpenApi';
import { getCLIName } from './utils';

const packageDetails = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));

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
    .option('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)', '')
    .option('-o, --output <value>', 'Output directory (required)', '')
    .option('-oc, --outputCore <value>', 'Output directory for core files')
    .option('-os, --outputServices <value>', 'Output directory for services')
    .option('-om, --outputModels <value>', 'Output directory for models')
    .option('-osm, --outputSchemas <value>', 'Output directory for schemas')
    .addOption(new Option('-c, --httpClient <value>', 'HTTP client to generate').choices([...Object.values(HttpClient)]).default(HttpClient.FETCH))
    .option('--useOptions <value>', 'Use options instead of arguments', false)
    .option('--useUnionTypes <value>', 'Use union types instead of enums', false)
    .option('--exportCore <value>', 'Write core files to disk', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportModels <value>', 'Write models to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .option('--clean <value>', 'Clean a directory before generation', true)
    .option('--request <value>', 'Path to custom request file')
    .option('--interfacePrefix <value>', 'Prefix for interface model(default: "I")')
    .option('--enumPrefix <value>', 'Prefix for enum model(default: "E")')
    .option('--typePrefix <value>', 'Prefix for type model(default: "T")')
    .option('--useCancelableRequest <value>', 'Use cancelled promise as returned data type in request(default: false)', false)
    .addOption(new Option('-l, --logLevel <level>', 'Logging level').choices([...Object.values(ELogLevel)]).default(ELogLevel.ERROR))
    .addOption(new Option('-t, --logTarget <target>', 'Target of logging').choices([...Object.values(ELogOutput)]).default(ELogOutput.CONSOLE))
    .option('-s, --sortByRequired', 'Property sorting strategy: simplified or extended')
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
    .hook('preAction', () => {
        updateNotifier.checkAndNotify();
    })
    .action(() => {
        chekOpenApiConfig();
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
