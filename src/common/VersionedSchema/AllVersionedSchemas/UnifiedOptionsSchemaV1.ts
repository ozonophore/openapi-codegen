import {z} from 'zod';

import { additionalParametersSchemaV2, experimentalParametersSchemaV2, outputPathsSchema, specialParametersSchemasV2 } from '../CommonSchemas';
import { unifiedOptionsShape } from './UnifiedBase';

const outputPathsSchemaWithoutOutput = outputPathsSchema.omit({ output: true });

export const unifiedOptionsSchemaV1 = z.object({
    ...unifiedOptionsShape.shape,
    ...outputPathsSchemaWithoutOutput.shape,
    ...specialParametersSchemasV2.shape,
    ...additionalParametersSchemaV2.shape,
    ...experimentalParametersSchemaV2.shape,
});

/*
type TUnified = {
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS;
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
    items: { ... 13 more }[] | undefined;
    input: string | undefined;
    output: string | undefined;
}
*/