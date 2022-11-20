/* istanbul ignore file */
import { Context } from './core/Context';
import { HttpClient } from './HttpClient';
import { Parser as ParserV2 } from './openApi/v2/Parser';
import { Parser as ParserV3 } from './openApi/v3/Parser';
import { rmdir } from './utils/fileSystem';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { isString } from './utils/isString';
import { IOutput } from './utils/output';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { WriteClient } from './utils/writeClient';

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
    useCancelableRequest?: boolean;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input: The relative location of the OpenAPI spec
 * @param output: The relative location of the output directory
 * @param outputCore: The relative location of the output directory for core
 * @param outputServices: The relative location of the output directory for services
 * @param outputModels: The relative location of the output directory for models
 * @param outputSchemas: The relative location of the output directory for schemas
 * @param httpClient: The selected httpClient (fetch or XHR)
 * @param useOptions: Use options or arguments functions
 * @param useUnionTypes: Use union types instead of enums
 * @param exportCore: Generate core client classes
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 * @param clean: Clean a directory before generation
 * @param request: Path to custom request file
 * @param write: Write the files to disk (true or false)
 * @param interfacePrefix: Prefix for interface model(I)
 * @param enumPrefix: Prefix for enum model(E)
 * @param typePrefix: Prefix for type model(T)
 */
async function generateFrom(
    {
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
        useCancelableRequest = false,
    }: Options,
    writeClient: WriteClient
): Promise<void> {
    const outputPaths: IOutput = {
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
            if (!write) break;
            await writeClient.writeClient({
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
                useCancelableRequest,
            });
            break;
        }

        case OpenApiVersion.V3: {
            const client = new ParserV3(context).parse(openApi);
            const clientFinal = postProcessClient(client);
            if (!write) break;
            await writeClient.writeClient({
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
                useCancelableRequest,
            });
            break;
        }
    }
}

export async function generate(options: Options | Options[]): Promise<void> {
    const optionsFinal = Array.isArray(options) ? options : Array.of(options);
    for (const option of optionsFinal) {
        if (option.output) {
            await rmdir(option.output);
        }
        if (option.outputCore) {
            await rmdir(option.outputCore);
        }
        if (option.outputSchemas) {
            await rmdir(option.outputSchemas);
        }
        if (option.outputModels) {
            await rmdir(option.outputModels);
        }
        if (option.outputServices) {
            await rmdir(option.outputServices);
        }
    }
    const writeClient = new WriteClient();
    for (const option of optionsFinal) {
        await generateFrom(option, writeClient);
    }
    await writeClient.combineAndWrite();
}
