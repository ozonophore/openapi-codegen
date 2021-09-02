import * as OpenAPI from "./index";

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

    it('downloads and parses v2 without issues', async () => {
        await OpenAPI.generate({
            input: 'https://raw.githubusercontent.com/ferdikoomen/openapi-typescript-codegen/master/test/spec/v2.json',
            output: './generated/v2-downloaded/',
            write: false,
        });
    });

    it('downloads and parses v3 without issues', async () => {
        await OpenAPI.generate({
            input: 'https://raw.githubusercontent.com/ferdikoomen/openapi-typescript-codegen/master/test/spec/v3.json',
            output: './generated/v3-downloaded/',
            write: false,
        });
    });

        it('should generate prolongation', async () => {
            await OpenAPI.generate({
                input: './test/spec/prolongation.yaml',
                output: './generated/prolongation/',
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
            input: './test/spec/v3.1.yaml',
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
