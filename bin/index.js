#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const pkg = require('../package.json');

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));
const { rmdirSync } = require('fs');
const { isAbsolute } = require('path');

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
function prepareGlobalConfig(config) {
    return {
        output: config.output,
        outputCore: config.outputCore,
        outputServices: config.outputServices,
        outputModels: config.outputModels,
        outputSchemas: config.outputSchemas,
        httpClient: config.client,
        useOptions: isValidJson(config.useOptions) ? JSON.parse(config.useOptions) : false,
        useUnionTypes: isValidJson(config.useUnionTypes) ? JSON.parse(config.useUnionTypes) : false,
        exportCore: isValidJson(config.exportCore) ? JSON.parse(config.exportCore) : false,
        exportServices: isValidJson(config.exportServices) ? JSON.parse(config.exportServices) : false,
        exportModels: isValidJson(config.exportModels) ? JSON.parse(config.exportModels) : false,
        exportSchemas: isValidJson(config.exportSchemas) ? JSON.parse(config.exportSchemas) : false,
        clean: isValidJson(config.clean) ? JSON.parse(config.clean) : false,
        request: config.request,
        interfacePrefix: config.interfacePrefix,
        enumPrefix: config.enumPrefix,
        typePrefix: config.typePrefix,
    };
}

/**
 * Preparation the configuration from secont level
 */
function prepareConfig(config, globalConfig) {
    return {
        input: config.input,
        output: config.output ? config.output : globalConfig.output,
        outputCore: config.outputCore ? config.outputCore : globalConfig.outputCore,
        outputServices: config.outputServices ? config.outputServices : globalConfig.outputServices,
        outputModels: config.outputModels ? config.outputModels : globalConfig.outputModels,
        outputSchemas: config.outputSchemas ? config.outputSchemas : globalConfig.outputSchemas,
        httpClient: config.client ? config.client : globalConfig.client,
        useOptions: isValidJson(config.useOptions) ? JSON.parse(config.useOptions) : globalConfig.useOptions,
        useUnionTypes: isValidJson(config.useUnionTypes) ? JSON.parse(config.useUnionTypes) : globalConfig.useUnionTypes,
        exportCore: isValidJson(config.exportCore) ? JSON.parse(config.exportCore) : globalConfig.exportCore,
        exportServices: isValidJson(config.exportServices) ? JSON.parse(config.exportServices) : globalConfig.exportServices,
        exportModels: isValidJson(config.exportModels) ? JSON.parse(config.exportModels) : globalConfig.exportModels,
        exportSchemas: isValidJson(config.exportSchemas) ? JSON.parse(config.exportSchemas) : globalConfig.exportSchemas,
        clean: isValidJson(config.clean) ? JSON.parse(config.clean) : false,
        request: config.request ? config.request : globalConfig.request,
        interfacePrefix: config.interfacePrefix ? config.interfacePrefix : globalConfig.interfacePrefix,
        enumPrefix: config.enumPrefix ? config.enumPrefix : globalConfig.enumPrefix,
        typePrefix: config.typePrefix ? config.typePrefix : globalConfig.typePrefix,
    };
}

function generate(config) {
    console.log('Generation is begun');
    return OpenAPI.generate(config)
        .then(() => {
            console.log('Generation is finished');
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
        const configsFormFile = isValidJson(dataString) ? JSON.parse(dataString) : [];
        const globalOptions = prepareGlobalConfig(Array.isArray(configFile) ? {} : configsFormFile);
        const configs = Array.isArray(configsFormFile) ? configsFormFile : configsFormFile.items;
        const configsFinal = configs.map(config => prepareConfig(config, globalOptions));
        if (params.clean || globalOptions.clean) {
            if (globalOptions && globalOptions.output) {
                rmdirSync(globalOptions.output, { recursive: true, force: true });
            }
            if (configsFinal) {
                configsFinal.forEach(config => {
                    if (config.output) {
                        rmdirSync(config.output, { recursive: true, force: true });
                    }
                });
            }
        }
        generate(configsFinal);
    } else {
        generate(params);
    }
}
