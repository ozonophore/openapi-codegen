import { z } from "zod";

import { HttpClient } from "../../../core";
import { optionsSchemaV1 } from "./OptionsSchemaV1";

export const optionsSchemaV2 = optionsSchemaV1.omit({ client: true }).extend({
    httpClient: z.enum(HttpClient),
});

/*
type TOptions = {
    output: string;
    input: string;
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS;
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
}
*/
