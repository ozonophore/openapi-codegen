import { z } from 'zod';

import { debugSettingsShape } from './UnifiedBase';
import { unifiedOptionsSchemaV2 } from './UnifiedOptionsSchemaV2';

export const unifiedOptionsSchemaV3 = z.object({
    ...unifiedOptionsSchemaV2.shape,
    ...debugSettingsShape.shape,
});

/*
type TUnified = {
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS;
    logLevel: ELogLevel.INFO | ELogLevel.WARN | ELogLevel.ERROR | undefined;
    logTarget: ELogOutput.CONSOLE | ELogOutput.FILE | undefined;
    useOptions: boolean | undefined;
    useUnionTypes: boolean | undefined;
    excludeCoreServiceFiles: boolean | undefined;
    validationLibrary: ValidationLibrary.NONE | ValidationLibrary.ZOD | ValidationLibrary.JOI | ValidationLibrary.YUP | ValidationLibrary.JSONSCHEMA | undefined;
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
}
*/
