import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import type { TStrictFlatOptions } from '../../common/TRawOptions';
import { Parser as ParserV2 } from '../api/v2/Parser';
import { OpenApi as OpenApiV2 } from '../api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from '../api/v3/Parser';
import { OpenApi as OpenApiV3 } from '../api/v3/types/OpenApi.model';
import type { LoadedSpec } from '../createResolvedContext';
import type { Client } from '../types/shared/Client.model';
import { getOpenApiVersion, OpenApiVersion } from '../utils/getOpenApiVersion';
import type { WriteClient } from '../write/WriteClient';

export type ParseItemParams = Pick<TStrictFlatOptions, 'miracles' | 'modelsMode' | 'useHistory' | 'diffReport'>;

export type PrepareClientFn = (params: {
    parse: () => Client;
    openApi: unknown;
    openApiVersion: OpenApiVersion;
    context: LoadedSpec['context'];
    miracles?: TStrictFlatOptions['miracles'];
    modelsMode?: TStrictFlatOptions['modelsMode'];
    useHistory?: boolean;
    diffReport?: string;
    inputPath?: string;
    logger: WriteClient['logger'];
}) => Client;

export function parseAndPrepareClient(spec: LoadedSpec, item: ParseItemParams, prepareClient: PrepareClientFn, absoluteInput: string, logger: WriteClient['logger']): Client {
    const { context, map, openApi } = spec;
    const openApiVersion = getOpenApiVersion(openApi);

    logger.info(LOGGER_MESSAGES.OPENAPI.DEFINING_VERSION);

    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = prepareClient({
                parse: () => new ParserV2(context, map).parse(openApi as OpenApiV2),
                openApi,
                openApiVersion,
                context,
                miracles: item.miracles,
                modelsMode: item.modelsMode,
                useHistory: item.useHistory,
                diffReport: item.diffReport,
                inputPath: absoluteInput,
                logger,
            });
            logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V2);
            return client;
        }
        case OpenApiVersion.V3: {
            const client = prepareClient({
                parse: () => new ParserV3(context, map).parse(openApi as OpenApiV3),
                openApi,
                openApiVersion,
                context,
                miracles: item.miracles,
                modelsMode: item.modelsMode,
                useHistory: item.useHistory,
                diffReport: item.diffReport,
                inputPath: absoluteInput,
                logger,
            });
            logger.info(LOGGER_MESSAGES.OPENAPI.WRITING_V3);
            return client;
        }
    }
}
