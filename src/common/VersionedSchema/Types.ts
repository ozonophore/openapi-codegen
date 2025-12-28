import Joi from 'joi';

import { EVersionedSchemaType } from './Enums';

export type VersionedSchema<T> = {
    schema: Joi.Schema<T>;
    type: EVersionedSchemaType;
    version: string;
};

export type SchemaMigrationPlan<From, To> = {
    fromVersion: string;
    toVersion: string;
    migrate: (input: From) => To;
    /**
     * Optional description of what this migration does.
     * Helps with debugging and documentation.
     */
    description?: string;
};

// A universal function for traversing the structure of an object with result typing
export type TraverseHandler<T> = (value: any, recurse: (v: any) => void, result: T) => boolean;

export type VersionMatchResult = {
    lastVersionIndex: number;
    latestVersion: string;
    firstVersion: string;
};
