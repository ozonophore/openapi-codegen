/* istanbul ignore file */
import { Context } from './core/Context';
import { HttpClient } from './HttpClient';
import { Parser as ParserV2 } from './openApi/v2/Parser';
import { Parser as ParserV3 } from './openApi/v3/Parser';
import { mkdir } from './utils/fileSystem';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { groupWriteClient } from './utils/groupWriteClient';
import { isString } from './utils/isString';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { IWriteClient, writeClient } from './utils/writeClient';
import { writeClientIndex } from './utils/writeClientIndex';

export { HttpClient } from './HttpClient';

export type Options = {
    input: string | Record<string, any>;
    output: string;
    outputCore?: string;
    outputServices?: string;
    outputModels?: string;
    outputSchemas?: string;
    httpClient?: HttpClient;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportModels?: boolean;
    exportSchemas?: boolean;
    clean?: boolean;
    request?: string;
    write?: boolean;
    interfacePrefix?: string;
    enumPrefix?: string;
    typePrefix?: string;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param outputCore The relative location of the output directory for core
 * @param outputServices The relative location of the output directory for services
 * @param outputModels The relative location of the output directory for models
 * @param outputSchemas The relative location of the output directory for schemas
 * @param httpClient The selected httpClient (fetch or XHR)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core client classes
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 * @param clean Clean a directory before generation
 * @param request: Path to custom request file
 * @param write Write the files to disk (true or false)
 * @param interfacePrefix Prefix for interface model(I)
 * @param enumPrefix Prefix for enum model(E)
 * @param typePrefix Prefix for type model(T)
 */
async function generateOne({
    input,
    output,
    outputCore,
    outputServices,
    outputModels,
    outputSchemas,
    httpClient = HttpClient.FETCH,
    useOptions = false,
    useUnionTypes = false,
    exportCore = true,
    exportServices = true,
    exportModels = true,
    exportSchemas = false,
    clean = true,
    request,
    write = true,
    interfacePrefix = 'I',
    enumPrefix = 'E',
    typePrefix = 'T',
}: Options): Promise<IWriteClient> {
    const outputPaths = {
        output: output,
        outputCore: outputCore,
        outputServices: outputServices,
        outputModels: outputModels,
        outputSchemas: outputSchemas,
    };
    const context = new Context(input, outputPaths, { interface: interfacePrefix, enum: enumPrefix, type: typePrefix });
    const openApi = isString(input) ? await getOpenApiSpec(context, input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
    });

    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = new ParserV2(context).parse(openApi);
            const clientFinal = postProcessClient(client);
            if (write) {
                await writeClient({
                    client: clientFinal,
                    templates,
                    output: outputPaths,
                    httpClient,
                    useOptions,
                    useUnionTypes,
                    exportCore,
                    exportServices,
                    exportModels,
                    exportSchemas,
                    clean,
                    request,
                });
            }
            return { client: clientFinal, templates, output: outputPaths, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, clean, request };
        }

        case OpenApiVersion.V3: {
            const client = new ParserV3(context).parse(openApi);
            const clientFinal = postProcessClient(client);
            if (write) {
                await writeClient({
                    client: clientFinal,
                    templates,
                    output: outputPaths,
                    httpClient,
                    useOptions,
                    useUnionTypes,
                    exportCore,
                    exportServices,
                    exportModels,
                    exportSchemas,
                    clean,
                    request,
                });
            }
            return { client: clientFinal, templates, output: outputPaths, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, clean, request };
        }
    }
}

export async function generate(configs: Array<Options> | Options) {
    const writeIndexMap: Map<string, Array<IWriteClient>> = new Map();
    const { useUnionTypes = false, useOptions = false, write = true } = Array.isArray(configs) ? configs[0] : configs;
    if (Array.isArray(configs)) {
        for (const config of configs) {
            const data = await generateOne(config);
            const items = writeIndexMap.get(config.output);
            if (items) {
                items.push(data);
            } else {
                const newItems = new Array<IWriteClient>();
                newItems.push(data);
                writeIndexMap.set(config.output, newItems);
            }
        }
    } else {
        const data = await generateOne(configs);
        const newItems = new Array<IWriteClient>();
        newItems.push(data);
        writeIndexMap.set(configs.output, newItems);
    }
    if (!write) {
        return;
    }
    const templates = registerHandlebarTemplates({
        httpClient: HttpClient.FETCH, // It doesn't matter what client is used
        useUnionTypes,
        useOptions,
    });
    writeIndexMap.forEach(async (value, key) => {
        const options = groupWriteClient(value);
        await mkdir(key);
        await writeClientIndex({ templates, outputPath: key, core: options.core, models: options.models, schemas: options.schemas, services: options.services });
    });
}
