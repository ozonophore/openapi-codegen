import Joi from 'joi';

/**
 * The scheme of a set of path parameters for finite directories.
 */
export const outputPathsSchema = Joi.object({
    output: Joi.string().required(),
    outputCore: Joi.string().optional(),
    outputServices: Joi.string().optional(),
    outputModels: Joi.string().optional(),
    outputSchemas: Joi.string().optional(),
});

/**
 * The scheme of the "accessibility" parameter set.
 */
export const specialParametersSchemas = Joi.object({
    useOptions: Joi.boolean().optional(),
    useUnionTypes: Joi.boolean().optional(),

    exportCore: Joi.boolean().optional(),
    exportServices: Joi.boolean().optional(),
    exportModels: Joi.boolean().optional(),
    exportSchemas: Joi.boolean().optional(),
});

/**
 * The scheme of additional parameters.
 */
export const additionalParametersSchema = Joi.object({
    clean: Joi.boolean().optional(),
    request: Joi.string().optional(),
    interfacePrefix: Joi.string().optional(),
    enumPrefix: Joi.string().optional(),
    typePrefix: Joi.string().optional(),
});

/**
 * The schema of experimental parameters.
 */
export const experimentalParametersSchema = Joi.object({
    useCancelableRequest: Joi.boolean().optional(),
});