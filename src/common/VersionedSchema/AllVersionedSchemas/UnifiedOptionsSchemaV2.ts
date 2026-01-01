import Joi from 'joi';

import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
import { 
    additionalParametersSchemaV2, 
    experimentalParametersSchemaV2, 
    outputPathsSchema,
    specialParametersSchemasV3, 
} from '../CommonSchemas';
import { mergeObjectSchemas } from '../Utils/mergeObjectSchemas';

const itemSchema = mergeObjectSchemas(
    Joi.object({
        input: Joi.string().required().description('Путь, URL или строка OpenAPI спецификации'),
        httpClient: Joi.string().valid(...Object.values(HttpClient)).optional(),
    }),
    outputPathsSchema,
    additionalParametersSchemaV2,
    experimentalParametersSchemaV2
);

/**
 * Unified options schema that supports both single and multi-item configurations.
 * Use either 'items' array for multiple specs OR 'input'/'output' for single spec.
 */
export const unifiedOptionsSchemaV2 = mergeObjectSchemas(
    Joi.object({
        // Multi-item configuration
        items: Joi.array()
            .items(itemSchema)
            .min(1)
            .optional()
            .description('Массив спецификаций для генерации'),
        
        // Single-item configuration (mutually exclusive with items)
        input: Joi.string()
            .when('items', {
                is: Joi.exist(),
                then: Joi.forbidden(),
                otherwise: Joi.required(),
            })
            .description('Путь, URL или строка OpenAPI спецификации'),
        output: Joi.string()
            .when('items', {
                is: Joi.exist(),
                then: Joi.forbidden(),
                otherwise: Joi.required(),
            })
            .description('Выходная директория'),
    }),
    outputPathsSchema, // outputCore, outputServices, etc. for single-item mode
    specialParametersSchemasV3,
    additionalParametersSchemaV2,
    experimentalParametersSchemaV2
).xor('items', 'input');