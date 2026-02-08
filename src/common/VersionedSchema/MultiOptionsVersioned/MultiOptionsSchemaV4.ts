import { z } from 'zod';

import { HttpClient } from '../../../core';
import { additionalParametersSchema, experimentalParametersSchema, outputPathsSchema, specialParametersSchemas } from '../CommonSchemas';

/**
 * The scheme of a set of generator options (v4)
 */
const multiItemSchemaV4 = z.object({
    ...outputPathsSchema.shape,
    input: z.string(),
});

export const multiOptionsSchemaV4 = z.object({
    ...specialParametersSchemas.shape,
    ...additionalParametersSchema.shape,
    ...experimentalParametersSchema.shape,
    httpClient: z.enum(HttpClient).optional(),
    items: z.array(multiItemSchemaV4).min(1),
});

/*
type TMulti = {
    items: { ... 6 more }[];
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS | undefined;
    useCancelableRequest: boolean | undefined;
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
}
*/