import * as OpenAPI from './index';

describe('index', () => {
    it('should generate from different files', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3.yml',
            output: './test/generated/v3_1/',
            write: true,
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
