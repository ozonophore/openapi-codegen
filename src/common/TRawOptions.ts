import { HttpClient } from '../core/types/enums/HttpClient.enum';
import { ELogLevel, ELogOutput } from './Enums';

type TItemConfig = {
    input: string;
    output: string;
    outputCore?: string;
    outputServices?: string;
    outputModels?: string;
    outputSchemas?: string;
    request?: string;
};

export type TRawOptions = {
    items?: TItemConfig[];
    input?: string;
    output?: string;
    outputCore?: string;
    outputServices?: string;
    outputModels?: string;
    outputSchemas?: string;
    httpClient?: HttpClient;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    excludeCoreServiceFiles?: boolean;
    includeSchemasFiles?: boolean;
    request?: string;
    interfacePrefix?: string;
    enumPrefix?: string;
    typePrefix?: string;
    useCancelableRequest?: boolean;
    logLevel?: ELogLevel;
    logTarget?: ELogOutput;
    sortByRequired?: boolean;
    useSeparatedIndexes?: boolean;
};

export type TFlatOptions = Omit<TRawOptions, 'items'>;

export type TStrictFlatOptions = {
    [P in keyof TFlatOptions]-?: NonNullable<TFlatOptions[P]>;
};
