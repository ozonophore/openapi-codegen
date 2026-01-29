import {z} from 'zod';

import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
import { ELogLevel, ELogOutput } from '../../Enums';
import { additionalParametersSchemaV2, experimentalParametersSchemaV2, outputPathsSchema } from '../CommonSchemas';

const unifiedItemSchema = z
    .object({
        ...outputPathsSchema.shape,
        ...additionalParametersSchemaV2.shape,
        ...experimentalParametersSchemaV2.shape,
        input: z.string().min(1),
        request: z.string().optional(),
    });


export const unifiedOptionsShape = z.object({
    items: z.array(unifiedItemSchema).min(1).optional(),
    input: z.string().optional(),
    output: z.string().optional(),
    httpClient: z.enum(HttpClient),
});

export const debugSettingsShape = z.object({
    logLevel: z.enum(ELogLevel).optional(),
    logTarget: z.enum(ELogOutput).optional(),
});
