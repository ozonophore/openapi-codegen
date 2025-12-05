import { experimentalParametersSchema } from "../CommonSchemas";
import { mergeObjectSchemas } from "../Utils/mergeObjectSchemas";
import { optionsSchemaV2 } from "./OptionsSchemaV2";

/**
 * The scheme of a set of generator options (Версия 3).
 */
export const optionsSchemaV3 = mergeObjectSchemas(optionsSchemaV2, experimentalParametersSchema);