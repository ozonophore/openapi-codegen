import { z } from "zod";

import { HttpClient } from '../../../core';
import { additionalParametersSchemaV2, experimentalParametersSchemaV2, outputPathsSchema, specialParametersSchemasV2 } from '../CommonSchemas';

export const optionsSchemaV4 = z.object({
    ...outputPathsSchema.shape,
    ...specialParametersSchemasV2.shape,
    ...additionalParametersSchemaV2.shape,
    ...experimentalParametersSchemaV2.shape,
    input: z.string().min(1),
    httpClient: z.enum(HttpClient),
});

/*
type TOptions = {
    input: string;
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS;
    output: string;
    useCancelableRequest: boolean | undefined;
    sortByRequired: boolean | undefined;
    useSeparatedIndexes: boolean | undefined;
    request: string | undefined;
    interfacePrefix: string | undefined;
    enumPrefix: string | undefined;
    typePrefix: string | undefined;
    useOptions: boolean | undefined;
    useUnionTypes: boolean | undefined;
    excludeCoreServiceFiles: boolean | undefined;
    includeSchemasFiles: boolean | undefined;
    outputCore: string | undefined;
    outputServices: string | undefined;
    outputModels: string | undefined;
    outputSchemas: string | undefined;
}
*/
