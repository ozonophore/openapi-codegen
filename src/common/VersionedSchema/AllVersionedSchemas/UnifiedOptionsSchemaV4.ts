import { z } from 'zod'

import { specialParametersSchemasV4 } from '../CommonSchemas'
import { unifiedOptionsSchemaV3 } from './UnifiedOptionsSchemaV3'

export const unifiedOptionsSchemaV4 = unifiedOptionsSchemaV3.extend({
    ...specialParametersSchemasV4.shape,
    customExecutorPath: z.string().optional(),
})

/*
type TUnified = {
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS;
    logLevel: ELogLevel.INFO | ELogLevel.WARN | ELogLevel.ERROR | undefined;
    logTarget: ELogOutput.CONSOLE | ELogOutput.FILE | undefined;
    sortByRequired: boolean | undefined;
    useSeparatedIndexes: boolean | undefined;
    useCancelableRequest: boolean | undefined;
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
    output: string | undefined;
    customExecutorPath: string | undefined;
    emptySchemaStrategy: EmptySchemaStrategy.SEMANTIC | EmptySchemaStrategy.SKIP | EmptySchemaStrategy.KEEP | undefined;
    excludeCoreServiceFiles: boolean | undefined;
    validationLibrary: ValidationLibrary.NONE | ValidationLibrary.ZOD | ValidationLibrary.JOI | ValidationLibrary.YUP | ValidationLibrary.JSONSCHEMA | undefined;
    useOptions: boolean | undefined;
    useUnionTypes: boolean | undefined;
}
*/