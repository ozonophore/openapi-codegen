#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const pkg = require('../package.json');

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));

function generate(config) {
    return OpenAPI.generate({
        input: config.input,
        output: config.output,
        httpClient: config.client,
        useOptions: config.useOptions,
        useUnionTypes: config.useUnionTypes,
        exportCore: JSON.parse(config.exportCore) === true,
        exportServices: JSON.parse(config.exportServices) === true,
        exportModels: JSON.parse(config.exportModels) === true,
        exportSchemas: JSON.parse(config.exportSchemas) === true,
        clean: JSON.parse(config.clean) === true,
        request: config.request,
    })
        .then(() => {
            console.log(`Generation from "${input}" was finished`);
        })
        .catch(error => {
            console.log(error);
            process.exit(1);
        });
}

if (OpenAPI) {
    const fs = require('fs');
    if (fs.existsSync('openapi.config.json')) {
        const dataString = fs.readFileSync('openapi.config.json');
        const configs = JSON.parse(dataString);
        configs.map(config => {
            generate(config);
        });
    } else {
        const params = program
            .name('openapi')
            .usage('[options]')
            .version(pkg.version)
            .requiredOption('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)')
            .requiredOption('-o, --output <value>', 'Output directory (required)')
            .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node]', 'fetch')
            .option('--useOptions', 'Use options instead of arguments')
            .option('--useUnionTypes', 'Use union types instead of enums')
            .option('--exportCore <value>', 'Write core files to disk', true)
            .option('--exportServices <value>', 'Write services to disk', true)
            .option('--exportModels <value>', 'Write models to disk', true)
            .option('--exportSchemas <value>', 'Write schemas to disk', false)
            .option('--clean <value>', 'Clean a directory before generation', true)
            .option('--request <value>', 'Path to custom request file')
            .parse(process.argv)
            .opts();
        generate(params);
    }
}
