import {z} from 'zod';

import { additionalParametersSchemaV2, experimentalParametersSchemaV2, specialParametersSchemasV2 } from '../CommonSchemas';
import { multiOptionsSchemaV4 } from './MultiOptionsSchemaV4';

const multiOptionsBaseV5 = multiOptionsSchemaV4.pick({
    items: true,
    httpClient: true,
    request: true,
    interfacePrefix: true,
    enumPrefix: true,
    typePrefix: true,
});

export const multiOptionsSchemaV5 = z.object({
    ...multiOptionsBaseV5.shape,
    ...specialParametersSchemasV2.shape,
    ...additionalParametersSchemaV2.shape,
    ...experimentalParametersSchemaV2.shape,
});

/*
type TMulti = {
    items: { ... 6 more }[];
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
    httpClient: HttpClient.FETCH | HttpClient.XHR | HttpClient.NODE | HttpClient.AXIOS | undefined;
}
*/
