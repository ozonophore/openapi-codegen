import Joi from 'joi';

import { HttpClient } from '../../../core';
import { additionalParametersSchema, outputPathsSchema, specialParametersSchemas } from '../CommonSchemas';
import { mergeObjectSchemas } from '../Utils/mergeObjectSchemas';

/**
 * The scheme of a set of generator options (v1)
 */
export const multiOptionsSchemaV1 = mergeObjectSchemas(
    Joi.object({
        input: Joi.string().required(),
        client: Joi.string().valid(...Object.values(HttpClient)),
        items: Joi.array()
            .items({
                input: Joi.string().required(),
            })
            .min(1)
            .required(),
    }),
    outputPathsSchema,
    specialParametersSchemas,
    additionalParametersSchema
);
