import {z} from 'zod';

import { experimentalParametersSchema } from '../CommonSchemas';
import { multiOptionsSchemaV2 } from './MultiOptionsSchemaV2';

/**
 * The scheme of a set of generator options (v3)
 */
export const multiOptionsSchemaV3 = z.object({
    ...multiOptionsSchemaV2.shape,
    ...experimentalParametersSchema.shape,
});

/*
type TMulti = {
    output: string;
    input: string;
    items: { ... 1 more }[];
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
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS | undefined;
}
*/