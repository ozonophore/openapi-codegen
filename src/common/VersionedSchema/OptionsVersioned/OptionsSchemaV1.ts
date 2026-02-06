import {z} from "zod";

import { HttpClient } from "../../../core";
import { additionalParametersSchema, outputPathsSchema, specialParametersSchemas } from "../CommonSchemas";

export const optionsSchemaV1 = z.object({
    ...outputPathsSchema.shape,
    ...specialParametersSchemas.shape,
    ...additionalParametersSchema.shape,
    input: z.string().min(1),
    client: z.enum(HttpClient),
});

/*
type TOptions = {
    input: string;
    client: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS;
    output: string;
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
