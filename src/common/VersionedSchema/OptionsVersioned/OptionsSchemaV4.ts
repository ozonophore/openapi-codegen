import Joi from "joi";

import { HttpClient } from '../../../core';
import { additionalParametersSchemaV2, experimentalParametersSchemaV2, outputPathsSchema, specialParametersSchemasV2 } from '../CommonSchemas';
import { mergeObjectSchemas } from '../Utils/mergeObjectSchemas';

/**
 * The scheme of a set of generator options (Версия 4).
 */
export const optionsSchemaV4 = mergeObjectSchemas(
    Joi.object({
        input: Joi.string().required(),
        httpClient: Joi.string().valid(...Object.values(HttpClient)),
    }),
    outputPathsSchema,
    specialParametersSchemasV2,
    additionalParametersSchemaV2,
    experimentalParametersSchemaV2,
);
