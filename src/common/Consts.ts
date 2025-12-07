import { HttpClient } from '../core';
import { ELogLevel, ELogOutput } from './Enums';
import { Logger } from './Logger';

export const DEFAULT_OPENAPI_CONFIG_FILENAME = 'openapi.config.json';

export const COMMON_DEFAULT_OPTIONS_VALUES = {
    outputCore: '',
    outputServices: '',
    outputModels: '',
    outputSchemas: '',
    httpClient: HttpClient.FETCH,
    useOptions: false,
    useUnionTypes: false,
    excludeCoreServiceFiles: false,
    includeSchemasFiles: false,
    interfacePrefix: 'I',
    enumPrefix: 'E',
    typePrefix: 'T',
    useCancelableRequest: false,
    logLevel: ELogLevel.ERROR,
    logTarget: ELogOutput.CONSOLE,
    sortByRequired: false,
    useSeparatedIndexes: false,
};

export const APP_LOGGER = new Logger({
    level: ELogLevel.INFO,
    instanceId: 'cli',
    logOutput: ELogOutput.CONSOLE,
});
