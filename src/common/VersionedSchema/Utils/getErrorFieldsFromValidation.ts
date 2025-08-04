import Joi from 'joi';

// Auxiliary function for getting error fields from the Joi validation result
export function getErrorFieldsFromValidation(error: Joi.ValidationError | undefined) {
    return error?.details.map(detail => ({ path: Array.isArray(detail.path) ? detail.path.join('.') : detail.path, type: detail.type })) ?? [];
}
