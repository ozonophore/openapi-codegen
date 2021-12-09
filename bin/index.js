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
    .parse(process.argv)
    .opts();

function isValidJson(value) {
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Preparation the configuration from the root level
 */
function prepareRootOptions(options) {
    return {
        output: options.output,
        outputCore: options.outputCore,
        outputServices: options.outputServices,
        outputModels: options.outputModels,
        outputSchemas: options.outputSchemas,
        httpClient: options.client,
        useOptions: isValidJson(options.useOptions) ? JSON.parse(options.useOptions) : false,
        useUnionTypes: isValidJson(options.useUnionTypes) ? JSON.parse(options.useUnionTypes) : false,
        exportCore: isValidJson(options.exportCore) ? JSON.parse(options.exportCore) : false,
        exportServices: isValidJson(options.exportServices) ? JSON.parse(options.exportServices) : false,
        exportModels: isValidJson(options.exportModels) ? JSON.parse(options.exportModels) : false,
        exportSchemas: isValidJson(options.exportSchemas) ? JSON.parse(options.exportSchemas) : false,
        clean: isValidJson(options.clean) ? JSON.parse(options.clean) : false,
        request: options.request,
        interfacePrefix: options.interfacePrefix ? options.interfacePrefix : 'I',
        enumPrefix: options.enumPrefix ? options.enumPrefix : 'E',
        typePrefix: options.typePrefix ? options.typePrefix : 'T',
    };
}

/**
 * Preparation the configuration from secont level
 */
function prepareOptions(options, rootOptions) {
    return {
        input: options.input,
        output: options.output ? options.output : rootOptions ? rootOptions.output : '',
        outputCore: options.outputCore ? options.outputCore : rootOptions ? rootOptions.outputCore : '',
        outputServices: options.outputServices ? options.outputServices : rootOptions ? rootOptions.outputServices : '',
        outputModels: options.outputModels ? options.outputModels : rootOptions ? rootOptions.outputModels : '',
        outputSchemas: options.outputSchemas ? options.outputSchemas : rootOptions ? rootOptions.outputSchemas: '',
        httpClient: options.client ? options.client : rootOptions ? rootOptions.client : '',
        useOptions: isValidJson(options.useOptions) ? JSON.parse(options.useOptions) : rootOptions ? rootOptions.useOptions : false,
        useUnionTypes: isValidJson(options.useUnionTypes) ? JSON.parse(options.useUnionTypes) : rootOptions ? rootOptions.useUnionTypes : false,
        exportCore: isValidJson(options.exportCore) ? JSON.parse(options.exportCore) : rootOptions ? rootOptions.exportCore : false,
        exportServices: isValidJson(options.exportServices) ? JSON.parse(options.exportServices) : rootOptions ? rootOptions.exportServices : false,
        exportModels: isValidJson(options.exportModels) ? JSON.parse(options.exportModels) : rootOptions ? rootOptions.exportModels : false,
        exportSchemas: isValidJson(options.exportSchemas) ? JSON.parse(options.exportSchemas) : rootOptions ? rootOptions.exportSchemas : false,
        clean: isValidJson(options.clean) ? JSON.parse(options.clean) : rootOptions ? rootOptions.clean : false,
        request: options.request ? options.request : rootOptions ? rootOptions.request : '',
        interfacePrefix: options.interfacePrefix ? options.interfacePrefix : rootOptions ? rootOptions.interfacePrefix : 'I',
        enumPrefix: options.enumPrefix ? options.enumPrefix : rootOptions ? rootOptions.enumPrefix : 'E',
        typePrefix: options.typePrefix ? options.typePrefix : rootOptions ? rootOptions.typePrefix : 'T',
    };
}

function generate(options) {
    return OpenAPI.generate(options)
        .then(() => {
            console.group(`Generation from "${options.input}"`);
            console.log(`Generation from "${options.input}" was finished\n`);
            console.log(`Output folder: ${path.resolve(process.cwd(), options.output)}\n`);
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
        const dataString = fs.readFileSync(configFile, { encoding: `UTF-8` });
        const configs = isValidJson(dataString) ? JSON.parse(dataString) : [];
        let operations = Array.isArray(configs) ? prepareOptions(configs) : prepareOptions(configs.items, prepareRootOptions(configs));
        if (params.clean) {
            configs.forEach(config => {
                rmdirSync(config.output, { recursive: true, force: true });
            });
        }
        operations.forEach(config => {
            generate(config);
        });
    } else {
        generate(prepareOptions(params));
    }
}
