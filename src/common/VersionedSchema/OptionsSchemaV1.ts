import Joi from "joi";

import { HttpClient } from "../../core";
import { additionalParametersSchema, outputPathsSchema, specialParametersSchemas } from "./CommonSchemas";
import { mergeObjectSchemas } from "./Utils/mergeObjectSchemas";

/**
 * The scheme of the set of generator options (Version 1).
 */
export const optionsSchemaV1 = mergeObjectSchemas(
    Joi.object({
        input: Joi.string().required(),
        client: Joi.string().valid(...Object.values(HttpClient)),
    }),
    outputPathsSchema,
    specialParametersSchemas,
    additionalParametersSchema,
);
