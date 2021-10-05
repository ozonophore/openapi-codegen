#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const pkg = require('../package.json');

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));
const { rmdirSync } = require('fs');

const params = program
    .name('openapi')
    .usage('[options]')
    .version(pkg.version)
    .option('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)')
    .option('-o, --output <value>', 'Output directory (required)')
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

function isValidJson(value) {
    if (!!value && typeof value !== 'string') {
        return false;
    }

    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}

function generate(config) {
    return OpenAPI.generate({
        input: config.input,
        output: config.output,
        httpClient: config.client,
        useOptions: isValidJson(config.useOptions) ? JSON.parse(config.useOptions) : false,
        useUnionTypes: isValidJson(config.useUnionTypes) ? JSON.parse(config.useUnionTypes) : false,
        exportCore: isValidJson(config.exportCore) ? JSON.parse(config.exportCore) : false,
        exportServices: isValidJson(config.exportServices) ? JSON.parse(config.exportServices) : false,
        exportModels: isValidJson(config.exportModels) ? JSON.parse(config.exportModels) : false,
        exportSchemas: isValidJson(config.exportSchemas) ? JSON.parse(config.exportSchemas) : false,
        clean: isValidJson(config.clean) ? JSON.parse(config.clean) : false,
        request: config.request,
    })
        .then(() => {
            console.group(`Generation from "${config.input}"`);
            console.log(`Generation from "${config.input}" was finished\n`);
            console.log(`Output folder: ${path.resolve(process.cwd(), config.output)}\n`);
            console.groupEnd();
        })
        .catch(error => {
            console.log(error);
            process.exit(1);
        });
}

if (OpenAPI) {
    const fs = require('fs');
    const configFile = path.resolve(process.cwd(), 'openapi.config.json');
    if (fs.existsSync(configFile)) {
        const dataString = fs.readFileSync(configFile);
        const configs = isValidJson(dataString) ? JSON.parse(dataString) : [];
        if (params.clean) {
            configs.forEach(config => {
                rmdirSync(config.output, { recursive: true, force: true });
            });
        }
        configs.forEach(config => {
            generate(config);
        });
    } else {
        generate(params);
    }
}
