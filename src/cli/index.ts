import { Command, OptionValues } from 'commander';

import { runGenerateOpenApi } from './generate/runGenerateOpenApi';

const APP_NAME = 'ts-openapi-codegen-cli';
const APP_VERSION = '1.0.0';

const program = new Command();

program.version(APP_VERSION).name(APP_NAME).description('Описание').addHelpText('before', 'Дополнительный текст');

program
    .command('generate')
    .usage('[options]')
    .version(APP_VERSION)
    .option('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)', '')
    .option('-o, --output <value>', 'Output directory (required)', '')
    .option('-oc, --outputCore <value>', 'Output directory for core files')
    .option('-os, --outputServices <value>', 'Output directory for services')
    .option('-om, --outputModels <value>', 'Output directory for models')
    .option('-osm, --outputSchemas <value>', 'Output directory for schemas')
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node]', 'fetch')
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
    .action(async (options: OptionValues) => {
        await runGenerateOpenApi(options);
    });

program.parse(process.argv);
