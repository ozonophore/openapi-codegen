import { generate as __generate, HttpClient } from '../../';

export const generate = async (dir: string, version: string, client: HttpClient, useOptions = false, useUnionTypes = false) => {
    await __generate({
        input: `./test/spec/${version}.json`,
        output: `./test/e2e/generated/${dir}/`,
        httpClient: client,
        useOptions,
        useUnionTypes,
    });
};
