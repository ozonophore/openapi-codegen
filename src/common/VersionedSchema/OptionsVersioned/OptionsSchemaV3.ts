import { z } from 'zod';

import { experimentalParametersSchema } from "../CommonSchemas";
import { optionsSchemaV2 } from "./OptionsSchemaV2";

/**
 * The scheme of a set of generator options (Версия 3).
 */
export const optionsSchemaV3 = z.object({
    ...optionsSchemaV2.shape,
    ...experimentalParametersSchema.shape,
});

/*
type TOptions = {
    output: string;
    input: string;
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS;
    useCancelableRequest: boolean | undefined;
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