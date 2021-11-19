import * as OpenAPI from './index';

describe('index', () => {
    it('parses v2 without issues', async () => {
        await OpenAPI.generate({
            input: './test/spec/v2.json',
            output: './generated/v2/',
            write: false,
        });
    });

    it('parses v3 without issues', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3.json',
            output: './generated/v3/',
            write: true,
        });
    });

    it('should generate path', async () => {
        await OpenAPI.generate({
            input: './test/spec/path.yaml',
            output: './generated/path/',
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

describe('index', () => {
    it('should generate object', async () => {
        await OpenAPI.generate({
            input: './test/spec/openapi2.yml',
            output: './generated/v3.1/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
            request: './test/custom/request.ts',
        });
    });
});

describe('index', () => {
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
