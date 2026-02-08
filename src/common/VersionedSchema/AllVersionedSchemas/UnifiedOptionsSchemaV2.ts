import {z} from 'zod';

import { specialParametersSchemasV3 } from '../CommonSchemas';
import { unifiedOptionsSchemaV1 } from './UnifiedOptionsSchemaV1';

export const unifiedOptionsSchemaV2 = z.object({
    ...unifiedOptionsSchemaV1.shape,
    ...specialParametersSchemasV3.shape,
});

/*
type TUnified = {
    output: string;
    useOptions: boolean | undefined;
    useUnionTypes: boolean | undefined;
    excludeCoreServiceFiles: boolean | undefined;
    validationLibrary: ValidationLibrary.NONE | ValidationLibrary.ZOD | ValidationLibrary.JOI | ValidationLibrary.YUP | ValidationLibrary.JSONSCHEMA | undefined;
    useCancelableRequest: boolean | undefined;
    sortByRequired: boolean | undefined;
    useSeparatedIndexes: boolean | undefined;
    request: string | undefined;
    interfacePrefix: string | undefined;
    enumPrefix: string | undefined;
    typePrefix: string | undefined;
    includeSchemasFiles: boolean | undefined;
    outputCore: string | undefined;
    outputServices: string | undefined;
    outputModels: string | undefined;
    outputSchemas: string | undefined;
    items: { ... 13 more }[] | undefined;
    input: string | undefined;
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS | undefined;
}
*/