import Joi from 'joi';

import { HttpClient } from '../../core';
import { additionalParametersSchema, experimentalParametersSchema, outputPathsSchema, specialParametersSchemas } from './CommonSchemas';
import { mergeObjectSchemas } from './Utils/mergeObjectSchemas';

/**
 * The scheme of a set of generator options (v4)
 */
export const multiOptionsSchemaV4 = mergeObjectSchemas(
    Joi.object({
        httpClient: Joi.string().valid(...Object.values(HttpClient)),
        items: Joi.array()
            .items(mergeObjectSchemas(
                Joi.object({
                    input: Joi.string().required(),
                }),
                outputPathsSchema,
            ))
            .min(1)
            .required(),
    }),
    specialParametersSchemas,
    additionalParametersSchema,
    experimentalParametersSchema
);
