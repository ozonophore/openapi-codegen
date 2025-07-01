import { experimentalParametersSchema } from "./CommonSchemas";
import { optionsSchemaV2 } from "./OptionsSchemaV2";
import { mergeObjectSchemas } from "./Utils/mergeObjectSchemas";

/**
 * The scheme of a set of generator options (Версия 2.0.0).
 */
export const optionsSchemaV3 = mergeObjectSchemas(optionsSchemaV2, experimentalParametersSchema);