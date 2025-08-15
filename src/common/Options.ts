import { HttpClient } from "../core/types/Enums";

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
    sortByRequired?: boolean;
};

export type TMultiOptions = {
  items: TOptions[];
} & Omit<TOptions, 'input' | 'output'>;