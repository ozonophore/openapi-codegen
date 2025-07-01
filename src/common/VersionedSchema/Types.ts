import Joi from 'joi';

import { EVersionedSchemaType } from './Enums';

export type VersionedSchema<T> = {
    schema: Joi.Schema<T>;
    type: EVersionedSchemaType;
    version: string;
}

export type SchemaMigrationPlan<From, To> = {
    fromVersion: string;
    toVersion: string;
    migrate: (input: From) => To;
}

export type GuessVersion = {
    version: string;
    index: number;
}

export type TraverseHandler = (
  value: any,
  recurse: (v: any) => void,
  result: Set<string>
) => boolean;