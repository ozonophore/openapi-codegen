import { z } from 'zod';

import { HttpClient } from '../../../core';
import { multiOptionsSchemaV1 } from './MultiOptionsSchemaV1';

export const multiOptionsSchemaV2 = multiOptionsSchemaV1.omit({ client: true }).extend({
    httpClient: z.enum(HttpClient).optional(),
});

/*
type TMulti = {
    output: string;
    input: string;
    items: { ... 1 more }[];
    outputCore: string | undefined;
    outputServices: string | undefined;
    outputModels: string | undefined;
    outputSchemas: string | undefined;
    useOptions: boolean | undefined;
    useUnionTypes: boolean | undefined;
    exportCore: boolean | undefined;
    exportServices: boolean | undefined;
    exportModels: boolean | undefined;
    exportSchemas: boolean | undefined;
    clean: boolean | undefined;
    request: string | undefined;
    interfacePrefix: string | undefined;
    enumPrefix: string | undefined;
    typePrefix: string | undefined;
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS | undefined;
}
*/