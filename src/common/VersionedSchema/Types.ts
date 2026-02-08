import { z } from 'zod';

import { EVersionedSchemaType } from './Enums';

export type VersionedSchema<TSchema extends z.ZodTypeAny> = {
    schema: TSchema;
    baseSchema: z.ZodObject<any>;
    version: string;
    type: EVersionedSchemaType;
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

export type VersionMatchResult = {
    lastVersionIndex: number;
    latestVersion: string;
    firstVersion: string;
};
