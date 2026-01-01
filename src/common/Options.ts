import { HttpClient } from '../core/types/enums/HttpClient.enum';
import { ValidationLibrary } from '../core/types/enums/ValidationLibrary.enum';

export type TOptions = {
    input: string | Record<string, any>;
    output: string;
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
    write?: boolean;
    interfacePrefix?: string;
    enumPrefix?: string;
    typePrefix?: string;
    useCancelableRequest?: boolean;
    sortByRequired?: boolean;
    useSeparatedIndexes?: boolean;
    validationLibrary?: ValidationLibrary
};

export type TMultiOptions = {
    items: TOptions[];
} & Omit<TOptions, 'input' | 'output'>;
