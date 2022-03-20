'use strict';

const OpenAPI = require('../dist');

async function generateV2() {
    await OpenAPI.generate({
        input: './spec/v2.json',
        output: './generated/v2/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
        request: './custom/request.ts',
    });
}

async function generateV3() {
    await OpenAPI.generate({
        input: './spec/v3.json',
        output: './generated/v3/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
        request: './custom/request.ts',
    });
}

async function generateV3allInOne() {
    await OpenAPI.generate({
        input: './spec/v3.json',
        output: './generated/v3_allInOne/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
        request: './custom/request.ts',
        outputModels: './generated/v3_allInOne/model',
        outputCore: './generated/v3_allInOne/',
        outputServices: './generated/v3_allInOne/',
        outputSchemas: './generated/v3_allInOne/',
    });
}

async function generate() {
    await generateV2();
    await generateV3();
    await generateV3allInOne();
}

generate();
