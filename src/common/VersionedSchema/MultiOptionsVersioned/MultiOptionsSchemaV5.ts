import Joi from 'joi';

import { HttpClient } from '../../../core';
import { additionalParametersSchemaV2, experimentalParametersSchemaV2, outputPathsSchema, specialParametersSchemasV2 } from '../CommonSchemas';
import { mergeObjectSchemas } from '../Utils/mergeObjectSchemas';

/**
 * The scheme of a set of generator options (v5)
 */
export const multiOptionsSchemaV5 = mergeObjectSchemas(
    Joi.object({
        httpClient: Joi.string().valid(...Object.values(HttpClient)),
        items: Joi.array()
            .items(
                mergeObjectSchemas(
                    Joi.object({
                        input: Joi.string().required(),
                    }),
                    outputPathsSchema
                )
            )
            .min(1)
            .required(),
    }),
    specialParametersSchemasV2,
    additionalParametersSchemaV2,
    experimentalParametersSchemaV2
);
