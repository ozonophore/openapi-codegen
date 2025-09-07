/* istanbul ignore file */
import path from 'path';

import { TMultiOptions, TOptions } from '../common/Options';
import { Parser as ParserV2 } from './api/v2/Parser';
import { OpenApi as OpenApiV2 } from './api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from './api/v3/Parser';
import { OpenApi as OpenApiV3 } from './api/v3/types/OpenApi.model';
import { Context } from './Context';
import { HttpClient } from './types/Enums';
import { IOutput } from './types/Models';
import { fileSystem } from './utils/fileSystem';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { getOutputPaths } from './utils/getOutputPaths';
import { isInstanceOfMultioptions } from './utils/isInstanceOfMultiOptions';
import { isString } from './utils/isString';
import { postProcessClient } from './utils/postProcessClient';
import { prepareOptions } from './utils/prepareOptions';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { WriteClient } from './WriteClient';

export { HttpClient } from './types/Enums';

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
 * @param useCancelableRequest Use cancelable request type.
 * @param sortByRequired Property sorting strategy: simplified or extended
 * @param useSeparatedIndexes Использовать отдельные index файлы для ядра, моделей, схем и сервисов
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
        sortByRequired = false,
        useSeparatedIndexes = false,
    }: TOptions,
    writeClient: WriteClient
): Promise<void> {
    const outputPaths: IOutput = getOutputPaths({
        output,
        outputCore,
        outputServices,
        outputModels,
        outputSchemas,
    });

    const context = new Context({ input, output: outputPaths, prefix: { interface: interfacePrefix, enum: enumPrefix, type: typePrefix }, sortByRequired });
    const openApi = isString(input) ? await getOpenApiSpec(context, input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
    });

    writeClient.logger.info('Defining the version of the openapi specification (2 or 3)');
    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = new ParserV2(context).parse(openApi as OpenApiV2);
            const clientFinal = postProcessClient(client);
            if (!write) break;
            writeClient.logger.info('Write our OpenAPI client version 2 to disk.');
            await writeClient.writeClient({
                client: clientFinal,
                templates,
                outputPaths,
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
                useSeparatedIndexes,
            });
            break;
        }

        case OpenApiVersion.V3: {
            const client = new ParserV3(context).parse(openApi as OpenApiV3);
            const clientFinal = postProcessClient(client);
            if (!write) break;
            writeClient.logger.info('Write our OpenAPI client version 3 to disk.');
            await writeClient.writeClient({
                client: clientFinal,
                templates,
                outputPaths,
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
                useSeparatedIndexes,
            });
            break;
        }
    }
}

export async function generate(options: TOptions | TOptions[] | TMultiOptions): Promise<void> {
    let preparedOptions: TOptions[] = [];
    if (Array.isArray(options)) {
        preparedOptions = options;
    } else if (isInstanceOfMultioptions(options)) {
        const { items, ...otherProps } = options as TMultiOptions;
        preparedOptions = items.map(item => ({ ...item, ...otherProps }));
    } else {
        preparedOptions = Array.of(options as TOptions);
    }

    const optionsFinal = preparedOptions.map(op => prepareOptions(op));

    const writeClient = new WriteClient();
    writeClient.logger.forceInfo(`Generation has begun. Total number of specification files: ${optionsFinal.length}`);

    try {
        const start = process.hrtime();
        for (const option of optionsFinal) {
            if (option.output) {
                await fileSystem.rmdir(option.output);
            }
            if (option.outputCore) {
                await fileSystem.rmdir(option.outputCore);
            }
            if (option.outputSchemas) {
                await fileSystem.rmdir(option.outputSchemas);
            }
            if (option.outputModels) {
                await fileSystem.rmdir(option.outputModels);
            }
            if (option.outputServices) {
                await fileSystem.rmdir(option.outputServices);
            }
        }

        for (const option of optionsFinal) {
            await generateFrom(option, writeClient);
            writeClient.logger.info(`Generation from "${option.input}" was finished`);
            writeClient.logger.info(`Output folder: ${path.resolve(process.cwd(), option.output)}`, true);
        }
        if (optionsFinal[0]?.useSeparatedIndexes) {
            await writeClient.combineAndWrightSimple();
        } else {
            await writeClient.combineAndWrite();
        }
        writeClient.logger.forceInfo("Generation from has been finished");
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationInMs = seconds + nanoseconds / 1e6;
        writeClient.logger.forceInfo(`Lead time: ${durationInMs.toFixed(2)} sec`);
    } catch (error: any) {
        writeClient.logger.error(error.message);
    }

    writeClient.logger.shutdownLogger();
}
