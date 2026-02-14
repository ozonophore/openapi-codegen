import { COMMON_DEFAULT_OPTIONS_VALUES } from '../common/Consts';
import { Logger } from '../common/Logger';
import { LOGGER_MESSAGES } from '../common/LoggerMessages';
import { TFlatOptions, TRawOptions, TStrictFlatOptions } from '../common/TRawOptions';
import { fileSystemHelpers } from '../common/utils/fileSystemHelpers';
import { resolveHelper } from '../common/utils/pathHelpers';
import { Parser as ParserV2 } from './api/v2/Parser';
import { OpenApi as OpenApiV2 } from './api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from './api/v3/Parser';
import { OpenApi as OpenApiV3 } from './api/v3/types/OpenApi.model';
import { Context } from './Context';
import { OutputPaths } from './types/base/OutputPaths.model';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { getOutputPaths } from './utils/getOutputPaths';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { WriteClient } from './WriteClient';


export class OpenApiClient {
    private _writeClient: WriteClient | null = null;

    public get writeClient() {
        if (!this._writeClient) {
            throw new Error('WriteClient must be initialized');
        }
        return this._writeClient;
    }

    private normalizeOptions(rawOptions: TRawOptions): TFlatOptions[] {
        if (rawOptions.items && rawOptions.items.length > 0) {
            // Для items: Наследуем глобальный request, если не переопределён
            return rawOptions.items.map(item => ({
                ...item,
                httpClient: rawOptions.httpClient,
                request: item.request ?? rawOptions.request, // ?? для fallback на глобальный
                useOptions: rawOptions.useOptions,
                useUnionTypes: rawOptions.useUnionTypes,
                includeSchemasFiles: rawOptions.includeSchemasFiles,
                excludeCoreServiceFiles: rawOptions.excludeCoreServiceFiles,
                interfacePrefix: rawOptions.interfacePrefix,
                enumPrefix: rawOptions.enumPrefix,
                typePrefix: rawOptions.typePrefix,
                useCancelableRequest: rawOptions.useCancelableRequest,
                logLevel: rawOptions.logLevel,
                logTarget: rawOptions.logTarget,
                sortByRequired: rawOptions.sortByRequired,
                useSeparatedIndexes: rawOptions.useSeparatedIndexes,
                validationLibrary: rawOptions.validationLibrary,
                emptySchemaStrategy: rawOptions.emptySchemaStrategy,
            }));
        } else {
            // Плоский формат (из CLI или старого конфига): Один item с глобальным request
            return [
                {
                    input: rawOptions.input ?? '',
                    output: rawOptions.output ?? '',
                    outputCore: rawOptions.outputCore,
                    outputServices: rawOptions.outputServices,
                    outputModels: rawOptions.outputModels,
                    outputSchemas: rawOptions.outputSchemas,
                    httpClient: rawOptions.httpClient,
                    useOptions: rawOptions.useOptions,
                    useUnionTypes: rawOptions.useUnionTypes,
                    includeSchemasFiles: rawOptions.includeSchemasFiles,
                    excludeCoreServiceFiles: rawOptions.excludeCoreServiceFiles,
                    request: rawOptions.request,
                    interfacePrefix: rawOptions.interfacePrefix,
                    enumPrefix: rawOptions.enumPrefix,
                    typePrefix: rawOptions.typePrefix,
                    useCancelableRequest: rawOptions.useCancelableRequest,
                    logLevel: rawOptions.logLevel,
                    logTarget: rawOptions.logTarget,
                    sortByRequired: rawOptions.sortByRequired,
                    useSeparatedIndexes: rawOptions.useSeparatedIndexes,
                    validationLibrary: rawOptions.validationLibrary,
                    emptySchemaStrategy: rawOptions.emptySchemaStrategy,
                },
            ];
        }
    }

    private addDefaultValues(item: TFlatOptions): TStrictFlatOptions {
        return {
            input: item.input || COMMON_DEFAULT_OPTIONS_VALUES.input,
            output: item.output || COMMON_DEFAULT_OPTIONS_VALUES.output,
            outputCore: item.outputCore || COMMON_DEFAULT_OPTIONS_VALUES.outputCore,
            outputServices: item.outputServices || COMMON_DEFAULT_OPTIONS_VALUES.outputServices,
            outputModels: item.outputModels || COMMON_DEFAULT_OPTIONS_VALUES.outputModels,
            outputSchemas: item.outputSchemas || COMMON_DEFAULT_OPTIONS_VALUES.outputSchemas,
            httpClient: item.httpClient || COMMON_DEFAULT_OPTIONS_VALUES.httpClient,
            useOptions: item.useOptions ?? COMMON_DEFAULT_OPTIONS_VALUES.useOptions,
            useUnionTypes: item.useUnionTypes ?? COMMON_DEFAULT_OPTIONS_VALUES.useUnionTypes,
            includeSchemasFiles: item.includeSchemasFiles ?? COMMON_DEFAULT_OPTIONS_VALUES.includeSchemasFiles,
            excludeCoreServiceFiles: item.excludeCoreServiceFiles ?? COMMON_DEFAULT_OPTIONS_VALUES.excludeCoreServiceFiles,
            request: item.request || COMMON_DEFAULT_OPTIONS_VALUES.request,
            interfacePrefix: item.interfacePrefix || COMMON_DEFAULT_OPTIONS_VALUES.interfacePrefix,
            enumPrefix: item.enumPrefix || COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix,
            typePrefix: item.typePrefix || COMMON_DEFAULT_OPTIONS_VALUES.typePrefix,
            useCancelableRequest: item.useCancelableRequest ?? COMMON_DEFAULT_OPTIONS_VALUES.useCancelableRequest,
            logLevel: item.logLevel || COMMON_DEFAULT_OPTIONS_VALUES.logLevel,
            logTarget: item.logTarget || COMMON_DEFAULT_OPTIONS_VALUES.logTarget,
            sortByRequired: item.sortByRequired ?? COMMON_DEFAULT_OPTIONS_VALUES.sortByRequired,
            useSeparatedIndexes: item.useSeparatedIndexes ?? COMMON_DEFAULT_OPTIONS_VALUES.useSeparatedIndexes,
            validationLibrary: item.validationLibrary ?? COMMON_DEFAULT_OPTIONS_VALUES.validationLibrary,
            emptySchemaStrategy: item.emptySchemaStrategy ?? COMMON_DEFAULT_OPTIONS_VALUES.emptySchemaStrategy,
        };
    }

    private async cleanOutputDirectories(option: TFlatOptions): Promise<void> {
        const outputDirs = [option.output, option.outputCore, option.outputSchemas, option.outputModels, option.outputServices];

        for (const dir of outputDirs) {
            if (dir) {
                await fileSystemHelpers.rmdir(dir);
            }
        }
    }

    private async generateCodeForItems(items: TStrictFlatOptions[]): Promise<void> {
        if (items.length === 0) {
            throw new Error(LOGGER_MESSAGES.GENERATION.NO_OPTIONS);
        }
        this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.STARTED(items.length));

        try {
            const start = process.hrtime.bigint();
            for (const option of items) {
                await this.cleanOutputDirectories(option);
            }

            for (const option of items) {
                const fileStart = process.hrtime.bigint();
                await this.generateSingle(option);
                const fileEnd = process.hrtime.bigint();
                const fileDurationInSeconds = Number(fileEnd - fileStart) / 1e9;
                this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.DURATION_FOR_FILE(option.input, fileDurationInSeconds.toFixed(3)));
            }
            if (items[0]?.useSeparatedIndexes) {
                await this.writeClient.combineAndWrightSimple();
            } else {
                await this.writeClient.combineAndWrite();
            }
            this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.FINISHED);
            const end = process.hrtime.bigint();
            const durationInSeconds = Number(end - start) / 1e9;
            this.writeClient.logger.forceInfo(LOGGER_MESSAGES.GENERATION.FINISHED_WITH_DURATION(durationInSeconds.toFixed(3)));
        } catch (error: any) {
            this.writeClient.logger.error(LOGGER_MESSAGES.ERROR.GENERIC(error.message));
        }

        this.writeClient.logger.shutdownLogger();
    }

    private async generateSingle(item: TStrictFlatOptions): Promise<void> {
        const {
            input,
            output,
            outputCore,
            outputServices,
            outputModels,
            outputSchemas,
            httpClient,
            useOptions,
            useUnionTypes,
            excludeCoreServiceFiles,
            request,
            interfacePrefix,
            enumPrefix,
            typePrefix,
            useCancelableRequest,
            sortByRequired,
            useSeparatedIndexes,
            validationLibrary = ValidationLibrary.NONE,
            emptySchemaStrategy = EmptySchemaStrategy.KEEP,
        } = item;
        const outputPaths: OutputPaths = getOutputPaths({
            output,
            outputCore,
            outputServices,
            outputModels,
            outputSchemas,
        });
        const absoluteInput = resolveHelper(process.cwd(), input);
        const context = new Context({ input: absoluteInput, output: outputPaths, prefix: { interface: interfacePrefix, enum: enumPrefix, type: typePrefix }, sortByRequired });
        const openApi = await getOpenApiSpec(context, absoluteInput);
        const openApiVersion = getOpenApiVersion(openApi);
        const templates = registerHandlebarTemplates({
            httpClient,
            useUnionTypes,
            useOptions,
            validationLibrary,
        });
        this.writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.DEFINING_VERSION);
        switch (openApiVersion) {
            case OpenApiVersion.V2: {
                const client = new ParserV2(context).parse(openApi as OpenApiV2);
                const clientFinal = postProcessClient(client);
                this.writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V2);
                await this.writeClient.writeClient({
                    client: clientFinal,
                    templates,
                    outputPaths,
                    httpClient,
                    useOptions,
                    useUnionTypes,
                    excludeCoreServiceFiles,
                    request,
                    useCancelableRequest,
                    useSeparatedIndexes,
                    validationLibrary,
                    emptySchemaStrategy,
                });
                break;
            }

            case OpenApiVersion.V3: {
                const client = new ParserV3(context).parse(openApi as OpenApiV3);
                const clientFinal = postProcessClient(client);
                this.writeClient.logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V3);
                await this.writeClient.writeClient({
                    client: clientFinal,
                    templates,
                    outputPaths,
                    httpClient,
                    useOptions,
                    useUnionTypes,
                    excludeCoreServiceFiles,
                    request,
                    useCancelableRequest,
                    useSeparatedIndexes,
                    validationLibrary,
                    emptySchemaStrategy,
                });
                break;
            }
        }
    }

    async generate(rawOptions: TRawOptions) {
        const logger = new Logger({
            level: rawOptions.logLevel ?? COMMON_DEFAULT_OPTIONS_VALUES.logLevel!,
            instanceId: 'client',
            logOutput: rawOptions.logTarget ?? COMMON_DEFAULT_OPTIONS_VALUES.logTarget!,
        });
        this._writeClient = new WriteClient(logger);

        const items = this.normalizeOptions(rawOptions).map(item => this.addDefaultValues(item));
        await this.generateCodeForItems(items);
    }
}
