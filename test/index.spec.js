'use strict';

const OpenAPI = require('../dist');
const glob = require('glob');
const fs = require('fs');

describe('v2', () => {
    it('should generate', async () => {
        await OpenAPI.generate({
            input: './test/spec/v2.json',
            output: './test/generated/v2/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });

        glob.sync('./test/generated/v2/**/*.ts').forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});

describe('v3', () => {
    it('should generate', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3.json',
            output: './test/generated/v3/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });

        glob.sync('./test/generated/v3/**/*.ts').forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });

    it('should generate from different files', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3.yml',
            output: './test/generated/v3_1/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });

        glob.sync('./test/generated/v3_1/**/*.ts').forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});

describe('v3.1', () => {
    it('should generate path', async () => {
        await OpenAPI.generate({
            input: './test/spec/openapi2.yml',
            output: './test/generated/openapi2/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: true,
            useUnionTypes: true,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
            request: './test/custom/request.ts',
        });
    });

    it('should generate object with alias', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3withAlias.yaml',
            output: './test/generated/v3withAlias/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });
    });
});
