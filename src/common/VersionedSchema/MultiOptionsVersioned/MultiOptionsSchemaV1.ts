import { z } from 'zod';

import { HttpClient } from '../../../core';
import { additionalParametersSchema, outputPathsSchema, specialParametersSchemas } from '../CommonSchemas';

const multiItemInputSchema = z.object({
    input: z.string(),
});

export const multiOptionsSchemaV1 = z.object({
    ...outputPathsSchema.shape,
    ...specialParametersSchemas.shape,
    ...additionalParametersSchema.shape,
    input: z.string(),
    client: z.enum(HttpClient).optional(),
    items: z.array(multiItemInputSchema).min(1),
});

/*
 type TMulti = {
    input: string;
    items: { ... 1 more }[];
    output: string;
    client: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS | undefined;
    clean: boolean | undefined;
    request: string | undefined;
    interfacePrefix: string | undefined;
    enumPrefix: string | undefined;
    typePrefix: string | undefined;
    useOptions: boolean | undefined;
    useUnionTypes: boolean | undefined;
    exportCore: boolean | undefined;
    exportServices: boolean | undefined;
    exportModels: boolean | undefined;
    exportSchemas: boolean | undefined;
    outputCore: string | undefined;
    outputServices: string | undefined;
    outputModels: string | undefined;
    outputSchemas: string | undefined;
}
 */
