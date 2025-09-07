import Joi from "joi";

import { HttpClient } from "../../core";
import { additionalParametersSchema,outputPathsSchema, specialParametersSchemas } from "./CommonSchemas";
import { mergeObjectSchemas } from "./Utils/mergeObjectSchemas";

/**
 * The scheme of a set of generator options (Версия 2).
 */
export const optionsSchemaV2 = mergeObjectSchemas(
    Joi.object({
        input: Joi.string().required(),
        httpClient: Joi.string().valid(...Object.values(HttpClient)),
    }),
    outputPathsSchema,
    specialParametersSchemas,
    additionalParametersSchema,
);
