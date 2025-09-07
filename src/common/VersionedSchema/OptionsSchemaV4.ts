import Joi from "joi";

import { optionsSchemaV3 } from "./OptionsSchemaV3";
import { mergeObjectSchemas } from "./Utils/mergeObjectSchemas";

/**
 * The scheme of a set of generator options (Версия 4).
 */
export const optionsSchemaV4 = mergeObjectSchemas(optionsSchemaV3, Joi.object({
    useSeparatedIndexes: Joi.boolean().optional(),
}));