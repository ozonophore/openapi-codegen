import Joi from 'joi';

import { HttpClient } from '../core/types/enums/HttpClient.enum';

export const defaultOptions = Joi.object({
    input: Joi.string().required(),
    output: Joi.string().required(),
    httpClient: Joi.string().valid(...Object.values(HttpClient)),

    outputCore: Joi.string().optional(),
    outputServices: Joi.string().optional(),
    outputModels: Joi.string().optional(),
    outputSchemas: Joi.string().optional(),

    useOptions: Joi.boolean().optional(),
    useUnionTypes: Joi.boolean().optional(),

    exportCore: Joi.boolean().optional(),
    exportServices: Joi.boolean().optional(),
    exportModels: Joi.boolean().optional(),
    exportSchemas: Joi.boolean().optional(),


    clean: Joi.boolean().optional(),
    request: Joi.string().optional(),
    interfacePrefix: Joi.string().optional(),
    enumPrefix: Joi.string().optional(),
    typePrefix: Joi.string().optional(),

    useCancelableRequest: Joi.boolean().optional(),
}).unknown(false);
