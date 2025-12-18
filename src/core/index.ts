/* istanbul ignore file */
import { TMultiOptions, TOptions } from '../common/Options';
import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { Parser as ParserV2 } from './api/v2/Parser';
import { OpenApi as OpenApiV2 } from './api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from './api/v3/Parser';
import { OpenApi as OpenApiV3 } from './api/v3/types/OpenApi.model';
import { Context } from './Context';
import { OutputPaths } from './types/base/OutputPaths.model';
import { HttpClient } from './types/enums/HttpClient.enum';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { getOutputPaths } from './utils/getOutputPaths';
import { isInstanceOfMultioptions } from './utils/isInstanceOfMultiOptions';
import { isString } from './utils/isString';
import { postProcessClient } from './utils/postProcessClient';
import { prepareOptions } from './utils/prepareOptions';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { WriteClient } from './WriteClient';

export { HttpClient } from './types/enums/HttpClient.enum';

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
 * @param excludeCoreServiceFiles The generation of the core and services is excluded
 * @param includeSchemasFiles The generation of model validation schemes is enabled
 * @param request: Path to custom request file
 * @param write: Write the files to disk (true or false)
 * @param interfacePrefix: Prefix for interface model(I)
 * @param enumPrefix: Prefix for enum model(E)
 * @param typePrefix: Prefix for type model(T)
 * @param useCancelableRequest Use cancelable request type.
 * @param sortByRequired Property sorting strategy: simplified or extended
 * @param useSeparatedIndexes Use separate index files for the core, models, schemas, and services
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
        excludeCoreServiceFiles = false,
        includeSchemasFiles = false,
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
    const outputPaths: OutputPaths = getOutputPaths({
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
                excludeCoreServiceFiles,
                includeSchemasFiles,
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
                excludeCoreServiceFiles,
                includeSchemasFiles,
                request,
                useCancelableRequest,
                useSeparatedIndexes,
            });
            break;
        }
    }
}

/**
 * @throws {Error} If options validation fails or generation encounters an error
 * @returns {Promise<void>}
 */
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
    writeClient.logger.forceInfo(`${GENERATION_MESSAGES.STARTED}. Total number of specification files: ${optionsFinal.length}`);

    if (optionsFinal.length === 0) {
        throw new Error('No options provided for generation');
    }

    try {
        const start = process.hrtime();
        for (const option of optionsFinal) {
            await cleanOutputDirectories(option);
        }

        for (const option of optionsFinal) {
            const fileStart = process.hrtime();
            await generateFrom(option, writeClient);
            const [fileSeconds, fileNanoseconds] = process.hrtime(fileStart);
            const fileDuration = fileSeconds + fileNanoseconds / 1e6;
            writeClient.logger.info(`Duration for "${option.input}": ${fileDuration.toFixed(2)} sec`);
        }
        if (optionsFinal[0]?.useSeparatedIndexes) {
            await writeClient.combineAndWrightSimple();
        } else {
            await writeClient.combineAndWrite();
        }
        writeClient.logger.forceInfo(GENERATION_MESSAGES.FINISHED);
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationInMs = seconds + nanoseconds / 1e6;
        writeClient.logger.forceInfo(GENERATION_MESSAGES.DURATION(durationInMs));
        writeClient.logger.forceInfo(GENERATION_MESSAGES.FINISHED);
    } catch (error: any) {
        writeClient.logger.error(error.message);
    }

    writeClient.logger.shutdownLogger();
}

const cleanOutputDirectories = async (option: TOptions): Promise<void> => {
    const outputDirs = [option.output, option.outputCore, option.outputSchemas, option.outputModels, option.outputServices];

    for (const dir of outputDirs) {
        if (dir) {
            await fileSystemHelpers.rmdir(dir);
        }
    }
};

const GENERATION_MESSAGES = {
    STARTED: 'Generation has begun',
    FINISHED: 'Generation from has been finished',
    FILE_FINISHED: (input: string) => `Generation from "${input}" was finished`,
    DURATION: (ms: number) => `Lead time: ${ms.toFixed(2)} sec`,
} as const;
