import { experimentalParametersSchema } from './CommonSchemas';
import { multiOptionsSchemaV2 } from './MultiOptionsSchemaV2';
import { mergeObjectSchemas } from './Utils/mergeObjectSchemas';

/**
 * The scheme of a set of generator options (v3)
 */
export const multiOptionsSchemaV3 = mergeObjectSchemas(multiOptionsSchemaV2, experimentalParametersSchema)
