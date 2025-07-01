import Joi, { ObjectSchema } from 'joi';

export function mergeObjectSchemas<T extends object>(...schemas: ObjectSchema<T>[]): ObjectSchema<T> {
    // We start with an "empty" object schema
    // we will immediately prohibit unknown fields
    return schemas.reduce<ObjectSchema<T>>((acc, sch) => acc.concat(sch), Joi.object() as ObjectSchema<T>).unknown(false);
}
